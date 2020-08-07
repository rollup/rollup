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
		outputOptions: NormalizedOutputOptions,
		unsetOptions: Set<string>,
		pluginDriver: PluginDriver,
		modulesById: Map<string, Module | ExternalModule>,
		chunkByModule: Map<Module, Chunk>,
		facadeChunkByModule: Map<Module, Chunk>,
		facadedModule: Module,
		facadeName: FacadeName
	): Chunk {
		const chunk = new Chunk(
			[],
			inputOptions,
			outputOptions,
			unsetOptions,
			pluginDriver,
			modulesById,
			chunkByModule,
			facadeChunkByModule,
			null
		);
		chunk.assignFacadeName(facadeName, facadedModule);
		if (!facadeChunkByModule.has(facadedModule)) {
			facadeChunkByModule.set(facadedModule, chunk);
		}
		for (const dependency of facadedModule.getDependenciesToBeIncluded()) {
			chunk.dependencies.add(
				dependency instanceof Module ? chunkByModule.get(dependency)! : dependency
			);
		}
		if (
			!chunk.dependencies.has(chunkByModule.get(facadedModule)!) &&
			facadedModule.moduleSideEffects &&
			facadedModule.hasEffects()
		) {
			chunk.dependencies.add(chunkByModule.get(facadedModule)!);
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
	variableName: string;

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
		private readonly outputOptions: NormalizedOutputOptions,
		private readonly unsetOptions: Set<string>,
		private readonly pluginDriver: PluginDriver,
		private readonly modulesById: Map<string, Module | ExternalModule>,
		private readonly chunkByModule: Map<Module, Chunk>,
		private readonly facadeChunkByModule: Map<Module, Chunk>,
		private readonly manualChunkAlias: string | null
	) {
		this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;
		const chunkModules = new Set(orderedModules);

		for (const module of orderedModules) {
			if (this.isEmpty && module.isIncluded()) {
				this.isEmpty = false;
			}
			if (module.isEntryPoint || outputOptions.preserveModules) {
				this.entryModules.push(module);
			}
			for (const importer of module.includedDynamicImporters) {
				if (!chunkModules.has(importer)) {
					this.dynamicEntryModules.push(module);
					// Modules with synthetic exports need an artifical namespace for dynamic imports
					if (module.syntheticNamedExports) {
						module.namespace.include();
						this.exports.add(module.namespace);
					}
				}
			}
			if (module.implicitlyLoadedAfter.size > 0) {
				this.implicitEntryModules.push(module);
			}
		}
		this.variableName = makeLegal(this.generateVariableName());
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

	generateExports() {
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
		if (this.outputOptions.minifyInternalExports) {
			assignExportsToMangledNames(
				remainingExports,
				this.exportsByName!,
				this.exportNamesByVariable
			);
		} else {
			assignExportsToNames(remainingExports, this.exportsByName!, this.exportNamesByVariable);
		}
		if (this.outputOptions.preserveModules || (this.facadeModule && this.facadeModule.isEntryPoint))
			this.exportMode = getExportMode(
				this,
				this.outputOptions,
				this.unsetOptions,
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
				(this.outputOptions.preserveModules ||
					module.preserveSignature !== 'strict' ||
					this.canModuleBeFacade(module, exposedVariables))
			) {
				this.facadeModule = module;
				this.facadeChunkByModule.set(module, this);
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
						this.outputOptions,
						this.unsetOptions,
						this.pluginDriver,
						this.modulesById,
						this.chunkByModule,
						this.facadeChunkByModule,
						module,
						facadeName
					)
				);
			}
		}
		for (const module of this.dynamicEntryModules) {
			if (module.syntheticNamedExports) continue;
			if (!this.facadeModule && this.canModuleBeFacade(module, exposedVariables)) {
				this.facadeModule = module;
				this.facadeChunkByModule.set(module, this);
				this.strictFacade = true;
				this.assignFacadeName({}, module);
			} else if (
				this.facadeModule === module &&
				!this.strictFacade &&
				this.canModuleBeFacade(module, exposedVariables)
			) {
				this.strictFacade = true;
			} else if (!this.facadeChunkByModule.get(module)?.strictFacade) {
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
		includeHash: boolean
	): string {
		if (this.fileName !== null) {
			return this.fileName;
		}
		const [pattern, patternName] =
			this.facadeModule && this.facadeModule.isUserDefinedEntryPoint
				? [options.entryFileNames, 'output.entryFileNames']
				: [options.chunkFileNames, 'output.chunkFileNames'];
		return makeUnique(
			renderNamePattern(
				pattern,
				patternName,
				{
					format: () => options.format,
					hash: () =>
						includeHash
							? this.computeContentHashWithDependencies(addons, options, existingNames)
							: '[hash]',
					name: () => this.getChunkName()
				},
				this.getChunkInfo.bind(this)
			),
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
				`${dirname(sanitizedId)}/${renderNamePattern(
					pattern,
					'output.entryFileNames',
					{
						ext: () => extension.substr(1),
						extname: () => extension,
						format: () => options.format as string,
						name: () => this.getChunkName()
					},
					this.getChunkInfo.bind(this)
				)}`
			);
		} else {
			path = `_virtual/${basename(sanitizedId)}`;
		}
		return makeUnique(normalize(path), existingNames);
	}

	getChunkInfo(): PreRenderedChunk {
		const facadeModule = this.facadeModule;
		const getChunkName = this.getChunkName.bind(this);
		return {
			exports: this.getExportNames(),
			facadeModuleId: facadeModule && facadeModule.id,
			isDynamicEntry: this.dynamicEntryModules.length > 0,
			isEntry: facadeModule !== null && facadeModule.isEntryPoint,
			isImplicitEntry: this.implicitEntryModules.length > 0,
			modules: this.renderedModules!,
			get name() {
				return getChunkName();
			},
			type: 'chunk'
		};
	}

	getChunkInfoWithFileNames(): RenderedChunk {
		return Object.assign(this.getChunkInfo(), {
			code: undefined,
			dynamicImports: Array.from(this.dynamicDependencies, getId),
			fileName: this.id!,
			implicitlyLoadedBefore: Array.from(this.implicitlyLoadedBefore, getId),
			imports: Array.from(this.dependencies, getId),
			map: undefined,
			referencedFiles: this.getReferencedFiles()
		});
	}

	getChunkName(): string {
		return this.name || (this.name = sanitizeFileName(this.getFallbackChunkName()));
	}

	getExportNames(): string[] {
		return (
			this.sortedExportNames || (this.sortedExportNames = Object.keys(this.exportsByName!).sort())
		);
	}

	getRenderedHash(): string {
		if (this.renderedHash) return this.renderedHash;
		const hash = createHash();
		const hashAugmentation = this.pluginDriver.hookReduceValueSync(
			'augmentChunkHash',
			'',
			[this.getChunkInfo()],
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
		if (this.outputOptions.preserveModules && variable instanceof NamespaceVariable) {
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
	preRender(options: NormalizedOutputOptions, inputBase: string) {
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
			outputPluginDriver: this.pluginDriver,
			varOrConst: options.preferConst ? 'const' : 'var'
		};

		// for static and dynamic entry points, inline the execution list to avoid loading latency
		if (
			options.hoistTransitiveImports &&
			!this.outputOptions.preserveModules &&
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
				if (namespace.included && !this.outputOptions.preserveModules) {
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
	}

	async render(options: NormalizedOutputOptions, addons: Addons, outputChunk: RenderedChunk) {
		timeStart('render format', 2);

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
		this.finaliseImportMetas(format);

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
					this.outputOptions.preserveModules ||
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

		timeEnd('render format', 2);

		let map: SourceMap = null as any;
		const chunkSourcemapChain: DecodedSourceMapOrMissing[] = [];

		let code = await renderChunk({
			code: prevCode,
			options,
			outputPluginDriver: this.pluginDriver,
			renderChunk: outputChunk,
			sourcemapChain: chunkSourcemapChain
		});
		if (options.sourcemap) {
			timeStart('sourcemap', 2);

			let file: string;
			if (options.file) file = resolve(options.sourcemapFile || options.file);
			else if (options.dir) file = resolve(options.dir, this.id!);
			else file = resolve(this.id!);

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

			timeEnd('sourcemap', 2);
		}
		if (options.compact !== true && code[code.length - 1] !== '\n') code += '\n';
		return { code, map };
	}

	private addDependenciesToChunk(
		moduleDependencies: Set<Module | ExternalModule>,
		chunkDependencies: Set<Chunk | ExternalModule>
	) {
		for (const module of moduleDependencies) {
			if (module instanceof Module) {
				const chunk = this.chunkByModule.get(module);
				if (chunk && chunk !== this) {
					chunkDependencies.add(chunk);
				}
			} else {
				chunkDependencies.add(module);
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
		existingNames: Record<string, any>
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
				hash.update(current.getRenderedHash());
				hash.update(current.generateId(addons, options, existingNames, false));
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
			if (!(importedVariable instanceof NamespaceVariable && this.outputOptions.preserveModules)) {
				const exportingModule = importedVariable.module;
				if (exportingModule instanceof Module) {
					const chunk = this.chunkByModule.get(exportingModule);
					if (chunk && chunk !== this) {
						chunk.exports.add(importedVariable);
						if (isSynthetic) {
							this.imports.add(importedVariable);
						}
					}
				}
			}
		}
	}

	private finaliseDynamicImports(options: NormalizedOutputOptions) {
		const stripKnownJsExtensions = options.format === 'amd';
		for (const [module, code] of this.renderedModuleSources) {
			for (const { node, resolution } of module.dynamicImports) {
				const chunk = this.chunkByModule.get(resolution as Module);
				const facadeChunk = this.facadeChunkByModule.get(resolution as Module);
				if (!resolution || !node.included || chunk === this) {
					continue;
				}
				const renderedResolution =
					resolution instanceof Module
						? `'${this.getRelativePath((facadeChunk || chunk!).id!, stripKnownJsExtensions)}'`
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
						!facadeChunk?.strictFacade &&
						chunk!.exportNamesByVariable!.get(resolution.namespace)![0],
					options
				);
			}
		}
	}

	private finaliseImportMetas(format: InternalModuleFormat): void {
		for (const [module, code] of this.renderedModuleSources) {
			for (const importMeta of module.importMetas) {
				importMeta.renderFinalMechanism(code, this.id!, format, this.pluginDriver);
			}
		}
	}

	private generateVariableName(): string {
		if (this.manualChunkAlias) {
			return this.manualChunkAlias;
		}
		const moduleForNaming =
			this.entryModules[0] ||
			this.implicitEntryModules[0] ||
			this.dynamicEntryModules[0] ||
			this.orderedModules[this.orderedModules.length - 1];
		if (moduleForNaming) {
			return moduleForNaming.chunkName || getAliasName(moduleForNaming.id);
		}
		return 'chunk';
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
				const module = variable.module!;
				if (module instanceof Module) {
					exportChunk = this.chunkByModule.get(module)!;
					if (exportChunk === this) continue;
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
						? this.chunkByModule.get(variable.module) === dep
						: variable.module === dep) &&
					!renderedImports.has(variable)
				) {
					renderedImports.add(variable);
					imports.push({
						imported:
							variable.module instanceof ExternalModule
								? variable.name
								: this.chunkByModule.get(variable.module!)!.getVariableExportName(variable),
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
				if (module && this.chunkByModule.get(module as Module) !== this) continue;
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

	private getReferencedFiles(): string[] {
		const referencedFiles: string[] = [];
		for (const module of this.orderedModules) {
			for (const meta of module.importMetas) {
				const fileName = meta.getReferencedFileName(this.pluginDriver);
				if (fileName) {
					referencedFiles.push(fileName);
				}
			}
		}
		return referencedFiles;
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
					const chunk = this.chunkByModule.get(resolution);
					if (chunk === this) {
						node.setInternalResolution(resolution.namespace);
					} else {
						node.setExternalResolution(
							this.facadeChunkByModule.get(resolution)?.exportMode || chunk!.exportMode,
							resolution
						);
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
			this.outputOptions.preserveModules,
			this.chunkByModule,
			syntheticExports,
			this.exportNamesByVariable!
		);
	}

	private setUpChunkImportsAndExportsForModule(module: Module) {
		const moduleImports = new Set(module.imports);
		// when we are not preserving modules, we need to make all namespace variables available for
		// rendering the namespace object
		if (!this.outputOptions.preserveModules) {
			const namespace = module.namespace;
			if (namespace.included) {
				const memberVariables = namespace.getMemberVariables();
				for (const name of Object.keys(memberVariables)) {
					moduleImports.add(memberVariables[name]);
				}
			}
		}
		for (let variable of moduleImports) {
			if (variable instanceof ExportDefaultVariable) {
				variable = variable.getOriginalVariable();
			}
			if (variable instanceof SyntheticNamedExportVariable) {
				variable = variable.getBaseVariable();
			}
			const chunk = this.chunkByModule.get(variable.module as Module);
			if (chunk !== this) {
				this.imports.add(variable);
				if (
					!(variable instanceof NamespaceVariable && this.outputOptions.preserveModules) &&
					variable.module instanceof Module
				) {
					chunk!.exports.add(variable);
				}
			}
		}
		if (
			module.namespace.included ||
			(module.isEntryPoint && module.preserveSignature !== false) ||
			module.includedDynamicImporters.some(importer => this.chunkByModule.get(importer) !== this)
		) {
			this.ensureReexportsAreAvailableForModule(module);
		}
		for (const { node, resolution } of module.dynamicImports) {
			if (
				node.included &&
				resolution instanceof Module &&
				this.chunkByModule.get(resolution) === this &&
				!resolution.namespace.included
			) {
				resolution.namespace.include();
				this.ensureReexportsAreAvailableForModule(resolution);
			}
		}
	}
}
