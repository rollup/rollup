import MagicString, { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import { relative } from '../browser/path';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import FunctionDeclaration from './ast/nodes/FunctionDeclaration';
import { UNDEFINED_EXPRESSION } from './ast/values';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import ExportShimVariable from './ast/variables/ExportShimVariable';
import LocalVariable from './ast/variables/LocalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import SyntheticNamedExportVariable from './ast/variables/SyntheticNamedExportVariable';
import Variable from './ast/variables/Variable';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import Module from './Module';
import {
	DecodedSourceMapOrMissing,
	GlobalsOption,
	InternalModuleFormat,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	PreRenderedChunk,
	RenderedChunk,
	RenderedModule,
	WarningHandler
} from './rollup/types';
import { Addons } from './utils/addons';
import { collapseSourcemaps } from './utils/collapseSourcemaps';
import { createHash } from './utils/crypto';
import { deconflictChunk } from './utils/deconflictChunk';
import { errFailedValidation, error } from './utils/error';
import { escapeId } from './utils/escapeId';
import { sortByExecutionOrder } from './utils/executionOrder';
import { assignExportsToMangledNames, assignExportsToNames } from './utils/exportNames';
import getExportMode from './utils/getExportMode';
import { getId } from './utils/getId';
import getIndentString from './utils/getIndentString';
import { makeLegal } from './utils/identifierHelpers';
import { basename, dirname, extname, isAbsolute, normalize, resolve } from './utils/path';
import { PluginDriver } from './utils/PluginDriver';
import relativeId, { getAliasName } from './utils/relativeId';
import renderChunk from './utils/renderChunk';
import { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { sanitizeFileName } from './utils/sanitizeFileName';
import { timeEnd, timeStart } from './utils/timers';
import { INTEROP_DEFAULT_VARIABLE, MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

export interface ModuleDeclarations {
	dependencies: ModuleDeclarationDependency[];
	exports: ChunkExports;
}

export interface ModuleDeclarationDependency {
	// these used as interop signifiers
	exportsDefault: boolean;
	exportsNames: boolean;
	globalName: string;
	id: string;
	imports?: ImportSpecifier[];
	isChunk: boolean;
	name: string;
	namedExportsMode: boolean;
	reexports?: ReexportSpecifier[];
}

export type ChunkDependencies = ModuleDeclarationDependency[];

export type ChunkExports = {
	exported: string;
	expression: string | null;
	hoisted: boolean;
	local: string;
	uninitialized: boolean;
}[];

export interface ReexportSpecifier {
	imported: string;
	needsLiveBinding: boolean;
	reexported: string;
}

export interface ImportSpecifier {
	imported: string;
	local: string;
}

interface FacadeName {
	fileName?: string;
	name?: string;
}

const NON_ASSET_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getGlobalName(
	module: ExternalModule,
	globals: GlobalsOption,
	hasExports: boolean,
	warn: WarningHandler
) {
	const globalName = typeof globals === 'function' ? globals(module.id) : globals[module.id];
	if (globalName) {
		return globalName;
	}

	if (hasExports) {
		warn({
			code: 'MISSING_GLOBAL_NAME',
			guess: module.variableName,
			message: `No name was provided for external module '${module.id}' in output.globals – guessing '${module.variableName}'`,
			source: module.id
		});
		return module.variableName;
	}
}

export default class Chunk {
	private static generateFacade(
		inputOptions: NormalizedInputOptions,
		unsetOptions: Set<string>,
		modulesById: Map<string, Module | ExternalModule>,
		facadedModule: Module,
		facadeName: FacadeName
	): Chunk {
		const chunk = new Chunk([], inputOptions, unsetOptions, modulesById);
		chunk.assignFacadeName(facadeName, facadedModule);
		if (!facadedModule.facadeChunk) {
			facadedModule.facadeChunk = chunk;
		}
		for (const dependency of facadedModule.getDependenciesToBeIncluded()) {
			chunk.dependencies.add(dependency instanceof Module ? dependency.chunk! : dependency);
		}
		if (
			!chunk.dependencies.has(facadedModule.chunk!) &&
			facadedModule.moduleSideEffects &&
			facadedModule.hasEffects()
		) {
			chunk.dependencies.add(facadedModule.chunk!);
		}
		chunk.ensureReexportsAreAvailableForModule(facadedModule);
		chunk.facadeModule = facadedModule;
		chunk.strictFacade = true;
		return chunk;
	}

	entryModules: Module[] = [];
	execIndex: number;
	exportMode: 'none' | 'named' | 'default' = 'named';
	facadeModule: Module | null = null;
	id: string | null = null;
	variableName = 'chunk';

	private dependencies = new Set<ExternalModule | Chunk>();
	private dynamicDependencies = new Set<ExternalModule | Chunk>();
	private dynamicEntryModules: Module[] = [];
	private exportNamesByVariable: Map<Variable, string[]> | null = null;
	private exports = new Set<Variable>();
	private exportsByName: Record<string, Variable> | null = null;
	private fileName: string | null = null;
	private implicitEntryModules: Module[] = [];
	private implicitlyLoadedBefore = new Set<Chunk>();
	private imports = new Set<Variable>();
	private indentString: string = undefined as any;
	private isEmpty = true;
	private manualChunkAlias: string | null = null;
	private name: string | null = null;
	private needsExportsShim = false;
	private renderedDependencies: Map<
		ExternalModule | Chunk,
		ModuleDeclarationDependency
	> | null = null;
	private renderedExports: ChunkExports | null = null;
	private renderedHash: string = undefined as any;
	private renderedModules?: {
		[moduleId: string]: RenderedModule;
	};
	private renderedModuleSources = new Map<Module, MagicString>();
	private renderedSource: MagicStringBundle | null = null;
	private sortedExportNames: string[] | null = null;
	private strictFacade = false;
	private usedModules: Module[] = undefined as any;

	constructor(
		private readonly orderedModules: Module[],
		private readonly inputOptions: NormalizedInputOptions,
		private readonly unsetOptions: Set<string>,
		private readonly modulesById: Map<string, Module | ExternalModule>
	) {
		this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;
		const chunkModules = new Set(orderedModules);

		for (const module of orderedModules) {
			if (this.isEmpty && module.isIncluded()) {
				this.isEmpty = false;
			}
			if (module.manualChunkAlias) {
				this.manualChunkAlias = module.manualChunkAlias;
			}
			module.chunk = this;
			if (module.isEntryPoint) {
				this.entryModules.push(module);
			}
			for (const importer of module.includedDynamicImporters) {
				if (!chunkModules.has(importer)) {
					this.dynamicEntryModules.push(module);
				}
			}
			if (module.implicitlyLoadedAfter.size > 0) {
				this.implicitEntryModules.push(module);
			}
		}

		const moduleForNaming =
			this.entryModules[0] ||
			this.implicitEntryModules[0] ||
			this.dynamicEntryModules[0] ||
			this.orderedModules[this.orderedModules.length - 1];
		if (moduleForNaming) {
			this.variableName = makeLegal(
				basename(
					moduleForNaming.chunkName ||
						moduleForNaming.manualChunkAlias ||
						getAliasName(moduleForNaming.id)
				)
			);
		}
	}

	canModuleBeFacade(module: Module, exposedVariables: Set<Variable>): boolean {
		const moduleExportNamesByVariable = module.getExportNamesByVariable();
		for (const exposedVariable of this.exports) {
			if (!moduleExportNamesByVariable.has(exposedVariable)) {
				if (
					moduleExportNamesByVariable.size === 0 &&
					module.isUserDefinedEntryPoint &&
					module.preserveSignature === 'strict' &&
					this.unsetOptions.has('preserveEntrySignatures')
				) {
					this.inputOptions.onwarn({
						code: 'EMPTY_FACADE',
						id: module.id,
						message: `To preserve the export signature of the entry module "${relativeId(
							module.id
						)}", an empty facade chunk was created. This often happens when creating a bundle for a web app where chunks are placed in script tags and exports are ignored. In this case it is recommended to set "preserveEntrySignatures: false" to avoid this and reduce the number of chunks. Otherwise if this is intentional, set "preserveEntrySignatures: 'strict'" explicitly to silence this warning.`,
						url: 'https://rollupjs.org/guide/en/#preserveentrysignatures'
					});
				}
				return false;
			}
		}
		for (const exposedVariable of exposedVariables) {
			if (
				!(moduleExportNamesByVariable.has(exposedVariable) || exposedVariable.module === module)
			) {
				return false;
			}
		}
		return true;
	}

	generateExports(options: NormalizedOutputOptions) {
		this.sortedExportNames = null;
		this.exportsByName = Object.create(null);
		this.exportNamesByVariable = new Map();
		const remainingExports = new Set(this.exports);
		if (
			this.facadeModule !== null &&
			(this.facadeModule.preserveSignature !== false || this.strictFacade)
		) {
			const exportNamesByVariable = this.facadeModule.getExportNamesByVariable();
			for (const [variable, exportNames] of exportNamesByVariable) {
				this.exportNamesByVariable.set(variable, [...exportNames]);
				for (const exportName of exportNames) {
					this.exportsByName![exportName] = variable;
				}
				remainingExports.delete(variable);
			}
		}
		if (options.minifyInternalExports) {
			assignExportsToMangledNames(
				remainingExports,
				this.exportsByName!,
				this.exportNamesByVariable
			);
		} else {
			assignExportsToNames(remainingExports, this.exportsByName!, this.exportNamesByVariable);
		}
		if (this.inputOptions.preserveModules || (this.facadeModule && this.facadeModule.isEntryPoint))
			this.exportMode = getExportMode(
				this,
				options,
				this.facadeModule!.id,
				this.inputOptions.onwarn
			);
	}

	generateFacades(): Chunk[] {
		const facades: Chunk[] = [];
		const entryModules = new Set([...this.entryModules, ...this.implicitEntryModules]);
		const exposedVariables = new Set<Variable>(
			this.dynamicEntryModules.map(module => module.namespace)
		);
		for (const module of entryModules) {
			if (module.preserveSignature) {
				for (const exportedVariable of module.getExportNamesByVariable().keys()) {
					exposedVariables.add(exportedVariable);
				}
			}
		}
		for (const module of entryModules) {
			const requiredFacades: FacadeName[] = Array.from(module.userChunkNames, name => ({
				name
			}));
			if (requiredFacades.length === 0 && module.isUserDefinedEntryPoint) {
				requiredFacades.push({});
			}
			requiredFacades.push(...Array.from(module.chunkFileNames, fileName => ({ fileName })));
			if (requiredFacades.length === 0) {
				requiredFacades.push({});
			}
			if (
				!this.facadeModule &&
				(this.inputOptions.preserveModules ||
					module.preserveSignature !== 'strict' ||
					this.canModuleBeFacade(module, exposedVariables))
			) {
				this.facadeModule = module;
				module.facadeChunk = this;
				if (module.preserveSignature) {
					this.strictFacade = module.preserveSignature === 'strict';
					this.ensureReexportsAreAvailableForModule(module);
				}
				this.assignFacadeName(requiredFacades.shift()!, module);
			}

			for (const facadeName of requiredFacades) {
				facades.push(
					Chunk.generateFacade(
						this.inputOptions,
						this.unsetOptions,
						this.modulesById,
						module,
						facadeName
					)
				);
			}
		}
		for (const module of this.dynamicEntryModules) {
			if (!this.facadeModule && this.canModuleBeFacade(module, exposedVariables)) {
				this.facadeModule = module;
				module.facadeChunk = this;
				this.strictFacade = true;
				this.assignFacadeName({}, module);
			} else if (
				this.facadeModule === module &&
				!this.strictFacade &&
				this.canModuleBeFacade(module, exposedVariables)
			) {
				this.strictFacade = true;
			} else if (!(module.facadeChunk && module.facadeChunk.strictFacade)) {
				module.namespace.include();
				this.exports.add(module.namespace);
			}
		}
		return facades;
	}

	generateId(
		addons: Addons,
		options: NormalizedOutputOptions,
		existingNames: Record<string, any>,
		includeHash: boolean,
		outputPluginDriver: PluginDriver
	): string {
		if (this.fileName !== null) {
			return this.fileName;
		}
		const [pattern, patternName] =
			this.facadeModule && this.facadeModule.isUserDefinedEntryPoint
				? [options.entryFileNames, 'output.entryFileNames']
				: [options.chunkFileNames, 'output.chunkFileNames'];
		return makeUnique(
			renderNamePattern(pattern, patternName, {
				format: () => options.format,
				hash: () =>
					includeHash
						? this.computeContentHashWithDependencies(
								addons,
								options,
								existingNames,
								outputPluginDriver
						  )
						: '[hash]',
				name: () => this.getChunkName()
			}),
			existingNames
		);
	}

	generateIdPreserveModules(
		preserveModulesRelativeDir: string,
		options: NormalizedOutputOptions,
		existingNames: Record<string, any>,
		unsetOptions: Set<string>
	): string {
		const id = this.orderedModules[0].id;
		const sanitizedId = sanitizeFileName(id);
		let path: string;
		if (isAbsolute(id)) {
			const extension = extname(id);
			const pattern = unsetOptions.has('entryFileNames')
				? NON_ASSET_EXTENSIONS.includes(extension)
					? '[name].js'
					: '[name][extname].js'
				: options.entryFileNames;
			path = relative(
				preserveModulesRelativeDir,
				`${dirname(sanitizedId)}/${renderNamePattern(pattern, 'output.entryFileNames', {
					ext: () => extension.substr(1),
					extname: () => extension,
					format: () => options.format as string,
					name: () => this.getChunkName()
				})}`
			);
		} else {
			path = `_virtual/${basename(sanitizedId)}`;
		}
		return makeUnique(normalize(path), existingNames);
	}

	getChunkName(): string {
		return this.name || (this.name = sanitizeFileName(this.getFallbackChunkName()));
	}

	getExportNames(): string[] {
		return (
			this.sortedExportNames || (this.sortedExportNames = Object.keys(this.exportsByName!).sort())
		);
	}

	getPrerenderedChunk(): PreRenderedChunk {
		const facadeModule = this.facadeModule;
		const getChunkName = this.getChunkName.bind(this);
		return {
			code: undefined,
			dynamicImports: Array.from(this.dynamicDependencies, getId),
			exports: this.getExportNames(),
			facadeModuleId: facadeModule && facadeModule.id,
			fileName: undefined,
			implicitlyLoadedBefore: Array.from(this.implicitlyLoadedBefore, getId),
			imports: Array.from(this.dependencies, getId),
			isDynamicEntry: this.dynamicEntryModules.length > 0,
			isEntry: facadeModule !== null && facadeModule.isEntryPoint,
			isImplicitEntry: this.implicitEntryModules.length > 0,
			map: undefined,
			modules: this.renderedModules!,
			get name() {
				return getChunkName();
			},
			type: 'chunk'
		};
	}

	getRenderedHash(outputPluginDriver: PluginDriver): string {
		if (this.renderedHash) return this.renderedHash;
		const hash = createHash();
		const hashAugmentation = outputPluginDriver.hookReduceValueSync(
			'augmentChunkHash',
			'',
			[this.getPrerenderedChunk()],
			(hashAugmentation, pluginHash) => {
				if (pluginHash) {
					hashAugmentation += pluginHash;
				}
				return hashAugmentation;
			}
		);
		hash.update(hashAugmentation);
		hash.update(this.renderedSource!.toString());
		hash.update(
			this.getExportNames()
				.map(exportName => {
					const variable = this.exportsByName![exportName];
					return `${relativeId((variable.module as Module).id).replace(/\\/g, '/')}:${
						variable.name
					}:${exportName}`;
				})
				.join(',')
		);
		return (this.renderedHash = hash.digest('hex'));
	}

	getVariableExportName(variable: Variable): string {
		if (this.inputOptions.preserveModules && variable instanceof NamespaceVariable) {
			return '*';
		}
		return this.exportNamesByVariable!.get(variable)![0];
	}

	link() {
		for (const module of this.orderedModules) {
			this.addDependenciesToChunk(module.getDependenciesToBeIncluded(), this.dependencies);
			this.addDependenciesToChunk(module.dynamicDependencies, this.dynamicDependencies);
			this.addDependenciesToChunk(module.implicitlyLoadedBefore, this.implicitlyLoadedBefore);
			this.setUpChunkImportsAndExportsForModule(module);
		}
	}

	// prerender allows chunk hashes and names to be generated before finalizing
	preRender(options: NormalizedOutputOptions, inputBase: string, outputPluginDriver: PluginDriver) {
		timeStart('render modules', 3);

		const magicString = new MagicStringBundle({ separator: options.compact ? '' : '\n\n' });
		this.usedModules = [];
		this.indentString = getIndentString(this.orderedModules, options);

		const n = options.compact ? '' : '\n';
		const _ = options.compact ? '' : ' ';

		const renderOptions: RenderOptions = {
			compact: options.compact,
			dynamicImportFunction: options.dynamicImportFunction,
			exportNamesByVariable: this.exportNamesByVariable!,
			format: options.format,
			freeze: options.freeze,
			indent: this.indentString,
			namespaceToStringTag: options.namespaceToStringTag,
			outputPluginDriver,
			varOrConst: options.preferConst ? 'const' : 'var'
		};

		// for static and dynamic entry points, inline the execution list to avoid loading latency
		if (
			options.hoistTransitiveImports &&
			!this.inputOptions.preserveModules &&
			this.facadeModule !== null
		) {
			for (const dep of this.dependencies) {
				if (dep instanceof Chunk) this.inlineChunkDependencies(dep);
			}
		}
		const sortedDependencies = [...this.dependencies];
		sortByExecutionOrder(sortedDependencies);
		this.dependencies = new Set(sortedDependencies);

		this.prepareDynamicImports();
		this.setIdentifierRenderResolutions(options);

		let hoistedSource = '';
		const renderedModules = (this.renderedModules = Object.create(null));

		for (const module of this.orderedModules) {
			let renderedLength = 0;
			if (module.isIncluded()) {
				const source = module.render(renderOptions).trim();
				renderedLength = source.length();
				if (renderedLength) {
					if (options.compact && source.lastLine().indexOf('//') !== -1) source.append('\n');
					this.renderedModuleSources.set(module, source);
					magicString.addSource(source);
					this.usedModules.push(module);
				}
				const namespace = module.namespace;
				if (namespace.included && !this.inputOptions.preserveModules) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += n + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
			}
			const { renderedExports, removedExports } = module.getRenderedExports();
			renderedModules[module.id] = {
				originalLength: module.originalCode.length,
				removedExports,
				renderedExports,
				renderedLength
			};
		}

		if (hoistedSource) magicString.prepend(hoistedSource + n + n);

		if (this.needsExportsShim) {
			magicString.prepend(
				`${n}${renderOptions.varOrConst} ${MISSING_EXPORT_SHIM_VARIABLE}${_}=${_}void 0;${n}${n}`
			);
		}
		if (options.compact) {
			this.renderedSource = magicString;
		} else {
			this.renderedSource = magicString.trim();
		}

		this.renderedHash = undefined as any;

		if (this.isEmpty && this.getExportNames().length === 0 && this.dependencies.size === 0) {
			const chunkName = this.getChunkName();
			this.inputOptions.onwarn({
				chunkName,
				code: 'EMPTY_BUNDLE',
				message: `Generated an empty chunk: "${chunkName}"`
			});
		}

		this.setExternalRenderPaths(options, inputBase);

		this.renderedDependencies = this.getChunkDependencyDeclarations(options);
		this.renderedExports =
			this.exportMode === 'none' ? [] : this.getChunkExportDeclarations(options.format);

		timeEnd('render modules', 3);
	}

	async render(
		options: NormalizedOutputOptions,
		addons: Addons,
		outputChunk: RenderedChunk,
		outputPluginDriver: PluginDriver
	) {
		timeStart('render format', 3);

		const chunkId = this.id!;
		const format = options.format;
		const finalise = finalisers[format];
		if (options.dynamicImportFunction && format !== 'es') {
			this.inputOptions.onwarn({
				code: 'INVALID_OPTION',
				message: '"output.dynamicImportFunction" is ignored for formats other than "es".'
			});
		}

		// populate ids in the rendered declarations only here
		// as chunk ids known only after prerender
		for (const dependency of this.dependencies) {
			const renderedDependency = this.renderedDependencies!.get(dependency)!;
			if (dependency instanceof ExternalModule) {
				const originalId = dependency.renderPath;
				renderedDependency.id = escapeId(
					dependency.renormalizeRenderPath ? this.getRelativePath(originalId, false) : originalId
				);
			} else {
				renderedDependency.namedExportsMode = dependency.exportMode !== 'default';
				renderedDependency.id = escapeId(this.getRelativePath(dependency.id!, false));
			}
		}

		this.finaliseDynamicImports(options);
		this.finaliseImportMetas(format, outputPluginDriver);

		const hasExports =
			this.renderedExports!.length !== 0 ||
			[...this.renderedDependencies!.values()].some(
				dep => (dep.reexports && dep.reexports.length !== 0)!
			);

		let usesTopLevelAwait = false;
		const accessedGlobals = new Set<string>();
		for (const module of this.orderedModules) {
			if (module.usesTopLevelAwait) {
				usesTopLevelAwait = true;
			}
			const accessedGlobalVariablesByFormat = module.scope.accessedGlobalVariablesByFormat;
			const accessedGlobalVariables =
				accessedGlobalVariablesByFormat && accessedGlobalVariablesByFormat.get(format);
			if (accessedGlobalVariables) {
				for (const name of accessedGlobalVariables) {
					accessedGlobals.add(name);
				}
			}
		}

		if (usesTopLevelAwait && format !== 'es' && format !== 'system') {
			return error({
				code: 'INVALID_TLA_FORMAT',
				message: `Module format ${format} does not support top-level await. Use the "es" or "system" output formats rather.`
			});
		}

		const magicString = finalise(
			this.renderedSource!,
			{
				accessedGlobals,
				dependencies: [...this.renderedDependencies!.values()],
				exports: this.renderedExports!,
				hasExports,
				indentString: this.indentString,
				intro: addons.intro!,
				isEntryModuleFacade:
					this.inputOptions.preserveModules ||
					(this.facadeModule !== null && this.facadeModule.isEntryPoint),
				namedExportsMode: this.exportMode !== 'default',
				outro: addons.outro!,
				usesTopLevelAwait,
				varOrConst: options.preferConst ? 'const' : 'var',
				warn: this.inputOptions.onwarn
			},
			options
		);
		if (addons.banner) magicString.prepend(addons.banner);
		if (addons.footer) magicString.append(addons.footer);
		const prevCode = magicString.toString();

		timeEnd('render format', 3);

		let map: SourceMap = null as any;
		const chunkSourcemapChain: DecodedSourceMapOrMissing[] = [];

		let code = await renderChunk({
			code: prevCode,
			options,
			outputPluginDriver,
			renderChunk: outputChunk,
			sourcemapChain: chunkSourcemapChain
		});
		if (options.sourcemap) {
			timeStart('sourcemap', 3);

			let file: string;
			if (options.file) file = resolve(options.sourcemapFile || options.file);
			else if (options.dir) file = resolve(options.dir, chunkId);
			else file = resolve(chunkId);

			const decodedMap = magicString.generateDecodedMap({});
			map = collapseSourcemaps(
				file,
				decodedMap,
				this.usedModules,
				chunkSourcemapChain,
				options.sourcemapExcludeSources,
				this.inputOptions.onwarn
			);
			map.sources = map.sources
				.map(sourcePath => {
					const { sourcemapPathTransform } = options;

					if (sourcemapPathTransform) {
						const newSourcePath = sourcemapPathTransform(sourcePath, `${file}.map`);

						if (typeof newSourcePath !== 'string') {
							error(errFailedValidation(`sourcemapPathTransform function must return a string.`));
						}

						return newSourcePath;
					}

					return sourcePath;
				})
				.map(normalize);

			timeEnd('sourcemap', 3);
		}
		if (options.compact !== true && code[code.length - 1] !== '\n') code += '\n';
		return { code, map };
	}

	private addDependenciesToChunk(
		moduleDependencies: Set<Module | ExternalModule>,
		chunkDependencies: Set<Chunk | ExternalModule>
	) {
		for (const depModule of moduleDependencies) {
			if (depModule instanceof Module) {
				if (depModule.chunk && depModule.chunk !== this) {
					chunkDependencies.add(depModule.chunk);
				}
			} else {
				chunkDependencies.add(depModule);
			}
		}
	}

	private assignFacadeName({ fileName, name }: FacadeName, facadedModule: Module) {
		if (fileName) {
			this.fileName = fileName;
		} else {
			this.name = sanitizeFileName(
				name || facadedModule.chunkName || getAliasName(facadedModule.id)
			);
		}
	}

	private computeContentHashWithDependencies(
		addons: Addons,
		options: NormalizedOutputOptions,
		existingNames: Record<string, any>,
		outputPluginDriver: PluginDriver
	): string {
		const hash = createHash();
		hash.update(
			[addons.intro, addons.outro, addons.banner, addons.footer].map(addon => addon || '').join(':')
		);
		hash.update(options.format as string);
		const dependenciesForHashing = new Set<Chunk | ExternalModule>([this]);
		for (const current of dependenciesForHashing) {
			if (current instanceof ExternalModule) {
				hash.update(':' + current.renderPath);
			} else {
				hash.update(current.getRenderedHash(outputPluginDriver));
				hash.update(current.generateId(addons, options, existingNames, false, outputPluginDriver));
			}
			if (current instanceof ExternalModule) continue;
			for (const dependency of [...current.dependencies, ...current.dynamicDependencies]) {
				dependenciesForHashing.add(dependency);
			}
		}
		return hash.digest('hex').substr(0, 8);
	}

	private ensureReexportsAreAvailableForModule(module: Module) {
		const map = module.getExportNamesByVariable();
		for (const exportedVariable of map.keys()) {
			const isSynthetic = exportedVariable instanceof SyntheticNamedExportVariable;
			const importedVariable = isSynthetic
				? (exportedVariable as SyntheticNamedExportVariable).getBaseVariable()
				: exportedVariable;
			const exportingModule = importedVariable.module;
			if (
				exportingModule &&
				exportingModule.chunk &&
				exportingModule.chunk !== this &&
				!(importedVariable instanceof NamespaceVariable && this.inputOptions.preserveModules)
			) {
				exportingModule.chunk.exports.add(importedVariable);
				if (isSynthetic) {
					this.imports.add(importedVariable);
				}
			}
		}
	}

	private finaliseDynamicImports(options: NormalizedOutputOptions) {
		const stripKnownJsExtensions = options.format === 'amd';
		for (const [module, code] of this.renderedModuleSources) {
			for (const { node, resolution } of module.dynamicImports) {
				if (
					!resolution ||
					!node.included ||
					(resolution instanceof Module && resolution.chunk === this)
				) {
					continue;
				}
				const renderedResolution =
					resolution instanceof Module
						? `'${this.getRelativePath(
								(resolution.facadeChunk || resolution.chunk!).id!,
								stripKnownJsExtensions
						  )}'`
						: resolution instanceof ExternalModule
						? `'${
								resolution.renormalizeRenderPath
									? this.getRelativePath(resolution.renderPath, stripKnownJsExtensions)
									: resolution.renderPath
						  }'`
						: resolution;
				node.renderFinalResolution(
					code,
					renderedResolution,
					resolution instanceof Module &&
						!(resolution.facadeChunk && resolution.facadeChunk.strictFacade) &&
						resolution.chunk!.exportNamesByVariable!.get(resolution.namespace)![0],
					options
				);
			}
		}
	}

	private finaliseImportMetas(
		format: InternalModuleFormat,
		outputPluginDriver: PluginDriver
	): void {
		for (const [module, code] of this.renderedModuleSources) {
			for (const importMeta of module.importMetas) {
				importMeta.renderFinalMechanism(code, this.id!, format, outputPluginDriver);
			}
		}
	}

	private getChunkDependencyDeclarations(
		options: NormalizedOutputOptions
	): Map<Chunk | ExternalModule, ModuleDeclarationDependency> {
		const reexportDeclarations = new Map<Chunk | ExternalModule, ReexportSpecifier[]>();

		for (let exportName of this.getExportNames()) {
			let exportChunk: Chunk | ExternalModule;
			let importName: string;
			let needsLiveBinding = false;
			if (exportName[0] === '*') {
				needsLiveBinding = options.externalLiveBindings;
				exportChunk = this.modulesById.get(exportName.substr(1)) as ExternalModule;
				importName = exportName = '*';
			} else {
				const variable = this.exportsByName![exportName];
				if (variable instanceof SyntheticNamedExportVariable) continue;
				const module = variable.module;
				if (!module || module.chunk === this) continue;
				if (module instanceof Module) {
					exportChunk = module.chunk!;
					importName = exportChunk.getVariableExportName(variable);
					needsLiveBinding = variable.isReassigned;
				} else {
					exportChunk = module;
					importName = variable.name;
					needsLiveBinding = options.externalLiveBindings;
				}
			}
			let reexportDeclaration = reexportDeclarations.get(exportChunk);
			if (!reexportDeclaration) reexportDeclarations.set(exportChunk, (reexportDeclaration = []));
			reexportDeclaration.push({ imported: importName, reexported: exportName, needsLiveBinding });
		}

		const renderedImports = new Set<Variable>();
		const dependencies = new Map<Chunk | ExternalModule, ModuleDeclarationDependency>();

		for (const dep of this.dependencies) {
			const imports: ImportSpecifier[] = [];
			for (const variable of this.imports) {
				if (
					(variable.module instanceof Module
						? variable.module.chunk === dep
						: variable.module === dep) &&
					!renderedImports.has(variable)
				) {
					renderedImports.add(variable);
					imports.push({
						imported:
							variable.module instanceof ExternalModule
								? variable.name
								: variable.module!.chunk!.getVariableExportName(variable),
						local: variable.getName()
					});
				}
			}

			const reexports = reexportDeclarations.get(dep);
			let exportsNames: boolean, exportsDefault: boolean;
			let namedExportsMode = true;
			if (dep instanceof ExternalModule) {
				exportsNames = dep.exportsNames || dep.exportsNamespace;
				exportsDefault = 'default' in dep.declarations;
			} else {
				exportsNames = true;
				// we don't want any interop patterns to trigger
				exportsDefault = false;
				namedExportsMode = dep.exportMode !== 'default';
			}

			dependencies.set(dep, {
				exportsDefault,
				exportsNames,
				globalName: (dep instanceof ExternalModule &&
					(options.format === 'umd' || options.format === 'iife') &&
					getGlobalName(
						dep,
						options.globals,
						exportsNames || exportsDefault,
						this.inputOptions.onwarn
					)) as string,
				id: undefined as any, // chunk id updated on render
				imports: imports.length > 0 ? imports : (null as any),
				isChunk: dep instanceof Chunk,
				name: dep.variableName,
				namedExportsMode,
				reexports
			});
		}

		return dependencies;
	}

	private getChunkExportDeclarations(format: InternalModuleFormat): ChunkExports {
		const exports: ChunkExports = [];
		for (const exportName of this.getExportNames()) {
			if (exportName[0] === '*') continue;

			const variable = this.exportsByName![exportName];
			if (!(variable instanceof SyntheticNamedExportVariable)) {
				const module = variable.module;
				if (module && module.chunk !== this) continue;
			}
			let expression = null;
			let hoisted = false;
			let uninitialized = false;
			let local = variable.getName();
			if (variable instanceof LocalVariable) {
				if (variable.init === UNDEFINED_EXPRESSION) {
					uninitialized = true;
				}
				for (const declaration of variable.declarations) {
					if (
						declaration.parent instanceof FunctionDeclaration ||
						(declaration instanceof ExportDefaultDeclaration &&
							declaration.declaration instanceof FunctionDeclaration)
					) {
						hoisted = true;
						break;
					}
				}
			} else if (variable instanceof SyntheticNamedExportVariable) {
				expression = local;
				if (format === 'es' && exportName !== 'default') {
					local = variable.renderName!;
				}
			}

			exports.push({
				exported: exportName,
				expression,
				hoisted,
				local,
				uninitialized
			});
		}
		return exports;
	}

	private getFallbackChunkName(): string {
		if (this.manualChunkAlias) {
			return this.manualChunkAlias;
		}
		if (this.fileName) {
			return getAliasName(this.fileName);
		}
		return getAliasName(this.orderedModules[this.orderedModules.length - 1].id);
	}

	private getRelativePath(targetPath: string, stripJsExtension: boolean): string {
		let relativePath = normalize(relative(dirname(this.id!), targetPath));
		if (stripJsExtension && relativePath.endsWith('.js')) {
			relativePath = relativePath.slice(0, -3);
		}
		if (relativePath === '..') return '../../' + basename(targetPath);
		if (relativePath === '') return '../' + basename(targetPath);
		return relativePath.startsWith('../') ? relativePath : './' + relativePath;
	}

	private inlineChunkDependencies(chunk: Chunk) {
		for (const dep of chunk.dependencies) {
			if (this.dependencies.has(dep)) continue;
			this.dependencies.add(dep);
			if (dep instanceof Chunk) {
				this.inlineChunkDependencies(dep);
			}
		}
	}

	private prepareDynamicImports() {
		for (const module of this.orderedModules) {
			for (const { node, resolution } of module.dynamicImports) {
				if (!node.included) continue;
				if (resolution instanceof Module) {
					if (resolution.chunk === this) {
						node.setInternalResolution(resolution.namespace);
					} else {
						node.setExternalResolution(resolution.chunk!.exportMode, resolution);
					}
				} else {
					node.setExternalResolution('auto', resolution);
				}
			}
		}
	}

	private setExternalRenderPaths(options: NormalizedOutputOptions, inputBase: string) {
		for (const dependency of [...this.dependencies, ...this.dynamicDependencies]) {
			if (dependency instanceof ExternalModule) {
				dependency.setRenderPath(options, inputBase);
			}
		}
	}

	private setIdentifierRenderResolutions(options: NormalizedOutputOptions) {
		const syntheticExports = new Set<SyntheticNamedExportVariable>();
		for (const exportName of this.getExportNames()) {
			const exportVariable = this.exportsByName![exportName];
			if (exportVariable instanceof ExportShimVariable) {
				this.needsExportsShim = true;
			}
			if (
				options.format !== 'es' &&
				options.format !== 'system' &&
				exportVariable.isReassigned &&
				!exportVariable.isId
			) {
				exportVariable.setRenderNames('exports', exportName);
			} else if (exportVariable instanceof SyntheticNamedExportVariable) {
				syntheticExports.add(exportVariable);
			} else {
				exportVariable.setRenderNames(null, null);
			}
		}

		const usedNames = new Set<string>();
		if (this.needsExportsShim) {
			usedNames.add(MISSING_EXPORT_SHIM_VARIABLE);
		}
		switch (options.format) {
			case 'es':
				break;
			case 'cjs':
				usedNames.add(INTEROP_DEFAULT_VARIABLE).add('require').add('__filename').add('__dirname');
			// fallthrough
			case 'system':
				usedNames.add('module');
			// fallthrough
			default:
				usedNames.add('exports');
		}

		deconflictChunk(
			this.orderedModules,
			this.dependencies,
			this.imports,
			usedNames,
			options.format as string,
			options.interop,
			this.inputOptions.preserveModules,
			syntheticExports,
			this.exportNamesByVariable!
		);
	}

	private setUpChunkImportsAndExportsForModule(module: Module) {
		for (let variable of module.imports) {
			if (variable instanceof ExportDefaultVariable) {
				variable = variable.getOriginalVariable();
			}
			if (variable instanceof SyntheticNamedExportVariable) {
				variable = variable.getBaseVariable();
			}
			if (variable.module && (variable.module as Module).chunk !== this) {
				this.imports.add(variable);
				if (
					!(variable instanceof NamespaceVariable && this.inputOptions.preserveModules) &&
					variable.module instanceof Module
				) {
					variable.module.chunk!.exports.add(variable);
				}
			}
		}
		if (
			(module.isEntryPoint && module.preserveSignature !== false) ||
			module.includedDynamicImporters.some(importer => importer.chunk !== this) ||
			module.namespace.included
		) {
			this.ensureReexportsAreAvailableForModule(module);
		}
		for (const { node, resolution } of module.dynamicImports) {
			if (
				node.included &&
				resolution instanceof Module &&
				resolution.chunk === this &&
				!resolution.namespace.included
			) {
				resolution.namespace.include();
				this.ensureReexportsAreAvailableForModule(resolution);
			}
		}
	}
}
