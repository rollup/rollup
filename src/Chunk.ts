import MagicString, { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import { relative } from '../browser/path';
import ExternalModule from './ExternalModule';
import Module from './Module';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import FunctionDeclaration from './ast/nodes/FunctionDeclaration';
import ChildScope from './ast/scopes/ChildScope';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import LocalVariable from './ast/variables/LocalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import SyntheticNamedExportVariable from './ast/variables/SyntheticNamedExportVariable';
import Variable from './ast/variables/Variable';
import finalisers from './finalisers/index';
import {
	DecodedSourceMapOrMissing,
	GetInterop,
	GlobalsOption,
	InternalModuleFormat,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	PreRenderedChunk,
	RenderedChunk,
	RenderedModule,
	WarningHandler
} from './rollup/types';
import { PluginDriver } from './utils/PluginDriver';
import { Addons } from './utils/addons';
import { collapseSourcemaps } from './utils/collapseSourcemaps';
import { createHash } from './utils/crypto';
import { deconflictChunk, DependenciesToBeDeconflicted } from './utils/deconflictChunk';
import {
	errCyclicCrossChunkReexport,
	errFailedValidation,
	errInvalidOption,
	error,
	errUnexpectedNamedImport,
	errUnexpectedNamespaceReexport
} from './utils/error';
import { escapeId } from './utils/escapeId';
import { assignExportsToMangledNames, assignExportsToNames } from './utils/exportNames';
import { GenerateCodeSnippets } from './utils/generateCodeSnippets';
import getExportMode from './utils/getExportMode';
import { getId } from './utils/getId';
import getIndentString from './utils/getIndentString';
import { getOrCreate } from './utils/getOrCreate';
import { getStaticDependencies } from './utils/getStaticDependencies';
import { makeLegal } from './utils/identifierHelpers';
import {
	defaultInteropHelpersByInteropType,
	HELPER_NAMES,
	isDefaultAProperty,
	namespaceInteropHelpersByInteropType
} from './utils/interopHelpers';
import { basename, dirname, extname, isAbsolute, normalize, resolve } from './utils/path';
import relativeId, { getAliasName } from './utils/relativeId';
import renderChunk from './utils/renderChunk';
import { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { timeEnd, timeStart } from './utils/timers';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

export interface ModuleDeclarations {
	dependencies: ModuleDeclarationDependency[];
	exports: ChunkExports;
}

export interface ModuleDeclarationDependency {
	defaultVariableName: string | undefined;
	globalName: string;
	id: string;
	imports: ImportSpecifier[] | null;
	isChunk: boolean;
	name: string;
	namedExportsMode: boolean;
	namespaceVariableName: string | undefined;
	reexports: ReexportSpecifier[] | null;
}

export type ChunkDependencies = ModuleDeclarationDependency[];

export type ChunkExports = {
	exported: string;
	expression: string | null;
	hoisted: boolean;
	local: string;
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
	entryModules: Module[] = [];
	execIndex: number;
	exportMode: 'none' | 'named' | 'default' = 'named';
	facadeModule: Module | null = null;
	id: string | null = null;
	namespaceVariableName = '';
	needsExportsShim = false;
	suggestedVariableName: string;
	variableName = '';

	private accessedGlobalsByScope = new Map<ChildScope, Set<string>>();
	private dependencies = new Set<ExternalModule | Chunk>();
	private dynamicDependencies = new Set<ExternalModule | Chunk>();
	private dynamicEntryModules: Module[] = [];
	private dynamicName: string | null = null;
	private exportNamesByVariable = new Map<Variable, string[]>();
	private exports = new Set<Variable>();
	private exportsByName: Record<string, Variable> = Object.create(null);
	private fileName: string | null = null;
	private implicitEntryModules: Module[] = [];
	private implicitlyLoadedBefore = new Set<Chunk>();
	private imports = new Set<Variable>();
	private indentString: string = undefined as never;
	private readonly isEmpty: boolean = true;
	private name: string | null = null;
	private renderedDependencies: Map<ExternalModule | Chunk, ModuleDeclarationDependency> | null =
		null;
	private renderedExports: ChunkExports | null = null;
	private renderedHash: string = undefined as never;
	private renderedModuleSources = new Map<Module, MagicString>();
	private renderedModules: {
		[moduleId: string]: RenderedModule;
	} = Object.create(null);
	private renderedSource: MagicStringBundle | null = null;
	private sortedExportNames: string[] | null = null;
	private strictFacade = false;
	private usedModules: Module[] = undefined as never;
	constructor(
		private readonly orderedModules: Module[],
		private readonly inputOptions: NormalizedInputOptions,
		private readonly outputOptions: NormalizedOutputOptions,
		private readonly unsetOptions: Set<string>,
		private readonly pluginDriver: PluginDriver,
		private readonly modulesById: Map<string, Module | ExternalModule>,
		private readonly chunkByModule: Map<Module, Chunk>,
		private readonly facadeChunkByModule: Map<Module, Chunk>,
		private readonly includedNamespaces: Set<Module>,
		private readonly manualChunkAlias: string | null
	) {
		this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;
		const chunkModules = new Set(orderedModules);

		for (const module of orderedModules) {
			if (module.namespace.included) {
				includedNamespaces.add(module);
			}
			if (this.isEmpty && module.isIncluded()) {
				this.isEmpty = false;
			}
			if (module.info.isEntry || outputOptions.preserveModules) {
				this.entryModules.push(module);
			}
			for (const importer of module.includedDynamicImporters) {
				if (!chunkModules.has(importer)) {
					this.dynamicEntryModules.push(module);
					// Modules with synthetic exports need an artificial namespace for dynamic imports
					if (module.info.syntheticNamedExports && !outputOptions.preserveModules) {
						includedNamespaces.add(module);
						this.exports.add(module.namespace);
					}
				}
			}
			if (module.implicitlyLoadedAfter.size > 0) {
				this.implicitEntryModules.push(module);
			}
		}
		this.suggestedVariableName = makeLegal(this.generateVariableName());
	}

	private static generateFacade(
		inputOptions: NormalizedInputOptions,
		outputOptions: NormalizedOutputOptions,
		unsetOptions: Set<string>,
		pluginDriver: PluginDriver,
		modulesById: Map<string, Module | ExternalModule>,
		chunkByModule: Map<Module, Chunk>,
		facadeChunkByModule: Map<Module, Chunk>,
		includedNamespaces: Set<Module>,
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
			includedNamespaces,
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
			facadedModule.info.hasModuleSideEffects &&
			facadedModule.hasEffects()
		) {
			chunk.dependencies.add(chunkByModule.get(facadedModule)!);
		}
		chunk.ensureReexportsAreAvailableForModule(facadedModule);
		chunk.facadeModule = facadedModule;
		chunk.strictFacade = true;
		return chunk;
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

	generateExports(): void {
		this.sortedExportNames = null;
		const remainingExports = new Set(this.exports);
		if (
			this.facadeModule !== null &&
			(this.facadeModule.preserveSignature !== false || this.strictFacade)
		) {
			const exportNamesByVariable = this.facadeModule.getExportNamesByVariable();
			for (const [variable, exportNames] of exportNamesByVariable) {
				this.exportNamesByVariable.set(variable, [...exportNames]);
				for (const exportName of exportNames) {
					this.exportsByName[exportName] = variable;
				}
				remainingExports.delete(variable);
			}
		}
		if (this.outputOptions.minifyInternalExports) {
			assignExportsToMangledNames(remainingExports, this.exportsByName, this.exportNamesByVariable);
		} else {
			assignExportsToNames(remainingExports, this.exportsByName, this.exportNamesByVariable);
		}
		if (this.outputOptions.preserveModules || (this.facadeModule && this.facadeModule.info.isEntry))
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
			if (!this.facadeModule) {
				const needsStrictFacade =
					module.preserveSignature === 'strict' ||
					(module.preserveSignature === 'exports-only' &&
						module.getExportNamesByVariable().size !== 0);
				if (
					!needsStrictFacade ||
					this.outputOptions.preserveModules ||
					this.canModuleBeFacade(module, exposedVariables)
				) {
					this.facadeModule = module;
					this.facadeChunkByModule.set(module, this);
					if (module.preserveSignature) {
						this.strictFacade = needsStrictFacade;
					}
					this.assignFacadeName(requiredFacades.shift()!, module);
				}
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
						this.includedNamespaces,
						module,
						facadeName
					)
				);
			}
		}
		for (const module of this.dynamicEntryModules) {
			if (module.info.syntheticNamedExports) continue;
			if (!this.facadeModule && this.canModuleBeFacade(module, exposedVariables)) {
				this.facadeModule = module;
				this.facadeChunkByModule.set(module, this);
				this.strictFacade = true;
				this.dynamicName = getChunkNameFromModule(module);
			} else if (
				this.facadeModule === module &&
				!this.strictFacade &&
				this.canModuleBeFacade(module, exposedVariables)
			) {
				this.strictFacade = true;
			} else if (!this.facadeChunkByModule.get(module)?.strictFacade) {
				this.includedNamespaces.add(module);
				this.exports.add(module.namespace);
			}
		}
		return facades;
	}

	generateId(
		addons: Addons,
		options: NormalizedOutputOptions,
		existingNames: Record<string, unknown>,
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
				typeof pattern === 'function' ? pattern(this.getChunkInfo()) : pattern,
				patternName,
				{
					format: () => options.format,
					hash: () =>
						includeHash
							? this.computeContentHashWithDependencies(addons, options, existingNames)
							: '[hash]',
					name: () => this.getChunkName()
				}
			),
			existingNames
		);
	}

	generateIdPreserveModules(
		preserveModulesRelativeDir: string,
		options: NormalizedOutputOptions,
		existingNames: Record<string, unknown>,
		unsetOptions: Set<string>
	): string {
		const id = this.orderedModules[0].id;
		const sanitizedId = this.outputOptions.sanitizeFileName(id);
		let path: string;
		if (isAbsolute(id)) {
			const extension = extname(id);
			const pattern = unsetOptions.has('entryFileNames')
				? '[name][assetExtname].js'
				: options.entryFileNames;
			const currentDir = dirname(sanitizedId);
			const fileName = renderNamePattern(
				typeof pattern === 'function' ? pattern(this.getChunkInfo()) : pattern,
				'output.entryFileNames',
				{
					assetExtname: () => (NON_ASSET_EXTENSIONS.includes(extension) ? '' : extension),
					ext: () => extension.substr(1),
					extname: () => extension,
					format: () => options.format as string,
					name: () => this.getChunkName()
				}
			);
			const currentPath = `${currentDir}/${fileName}`;
			const { preserveModulesRoot } = options;
			if (preserveModulesRoot && currentPath.startsWith(preserveModulesRoot)) {
				path = currentPath.slice(preserveModulesRoot.length).replace(/^[\\/]/, '');
			} else {
				path = relative(preserveModulesRelativeDir, currentPath);
			}
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
			isEntry: facadeModule !== null && facadeModule.info.isEntry,
			isImplicitEntry: this.implicitEntryModules.length > 0,
			modules: this.renderedModules,
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
			importedBindings: this.getImportedBindingsPerDependency(),
			imports: Array.from(this.dependencies, getId),
			map: undefined,
			referencedFiles: this.getReferencedFiles()
		});
	}

	getChunkName(): string {
		return (
			this.name || (this.name = this.outputOptions.sanitizeFileName(this.getFallbackChunkName()))
		);
	}

	getExportNames(): string[] {
		return (
			this.sortedExportNames || (this.sortedExportNames = Object.keys(this.exportsByName).sort())
		);
	}

	getRenderedHash(): string {
		if (this.renderedHash) return this.renderedHash;
		const hash = createHash();
		const hashAugmentation = this.pluginDriver.hookReduceValueSync(
			'augmentChunkHash',
			'',
			[this.getChunkInfo()],
			(augmentation, pluginHash) => {
				if (pluginHash) {
					augmentation += pluginHash;
				}
				return augmentation;
			}
		);
		hash.update(hashAugmentation);
		hash.update(this.renderedSource!.toString());
		hash.update(
			this.getExportNames()
				.map(exportName => {
					const variable = this.exportsByName[exportName];
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
		return this.exportNamesByVariable.get(variable)![0];
	}

	link(): void {
		this.dependencies = getStaticDependencies(this, this.orderedModules, this.chunkByModule);
		for (const module of this.orderedModules) {
			this.addDependenciesToChunk(module.dynamicDependencies, this.dynamicDependencies);
			this.addDependenciesToChunk(module.implicitlyLoadedBefore, this.implicitlyLoadedBefore);
			this.setUpChunkImportsAndExportsForModule(module);
		}
	}

	// prerender allows chunk hashes and names to be generated before finalizing
	preRender(
		options: NormalizedOutputOptions,
		inputBase: string,
		snippets: GenerateCodeSnippets
	): void {
		const { _, getPropertyAccess, n } = snippets;
		const magicString = new MagicStringBundle({ separator: `${n}${n}` });
		this.usedModules = [];
		this.indentString = getIndentString(this.orderedModules, options);

		const renderOptions: RenderOptions = {
			dynamicImportFunction: options.dynamicImportFunction,
			exportNamesByVariable: this.exportNamesByVariable,
			format: options.format,
			freeze: options.freeze,
			indent: this.indentString,
			namespaceToStringTag: options.namespaceToStringTag,
			outputPluginDriver: this.pluginDriver,
			snippets
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

		this.prepareModulesForRendering(snippets);
		this.setIdentifierRenderResolutions(options);

		let hoistedSource = '';
		const renderedModules = this.renderedModules;

		for (const module of this.orderedModules) {
			let renderedLength = 0;
			if (module.isIncluded() || this.includedNamespaces.has(module)) {
				const source = module.render(renderOptions).trim();
				renderedLength = source.length();
				if (renderedLength) {
					if (options.compact && source.lastLine().indexOf('//') !== -1) source.append('\n');
					this.renderedModuleSources.set(module, source);
					magicString.addSource(source);
					this.usedModules.push(module);
				}
				const namespace = module.namespace;
				if (this.includedNamespaces.has(module) && !this.outputOptions.preserveModules) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += n + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
			}
			const { renderedExports, removedExports } = module.getRenderedExports();
			const { renderedModuleSources } = this;
			renderedModules[module.id] = {
				get code() {
					return renderedModuleSources.get(module)?.toString() ?? null;
				},
				originalLength: module.originalCode.length,
				removedExports,
				renderedExports,
				renderedLength
			};
		}

		if (hoistedSource) magicString.prepend(hoistedSource + n + n);

		if (this.needsExportsShim) {
			magicString.prepend(
				`${n}${snippets.cnst} ${MISSING_EXPORT_SHIM_VARIABLE}${_}=${_}void 0;${n}${n}`
			);
		}
		if (options.compact) {
			this.renderedSource = magicString;
		} else {
			this.renderedSource = magicString.trim();
		}

		this.renderedHash = undefined as never;

		if (this.isEmpty && this.getExportNames().length === 0 && this.dependencies.size === 0) {
			const chunkName = this.getChunkName();
			this.inputOptions.onwarn({
				chunkName,
				code: 'EMPTY_BUNDLE',
				message: `Generated an empty chunk: "${chunkName}"`
			});
		}

		this.setExternalRenderPaths(options, inputBase);

		this.renderedDependencies = this.getChunkDependencyDeclarations(options, getPropertyAccess);
		this.renderedExports =
			this.exportMode === 'none'
				? []
				: this.getChunkExportDeclarations(options.format, getPropertyAccess);
	}

	async render(
		options: NormalizedOutputOptions,
		addons: Addons,
		outputChunk: RenderedChunk,
		snippets: GenerateCodeSnippets
	): Promise<{ code: string; map: SourceMap }> {
		timeStart('render format', 2);

		const format = options.format;
		const finalise = finalisers[format];
		if (options.dynamicImportFunction && format !== 'es') {
			this.inputOptions.onwarn(
				errInvalidOption(
					'output.dynamicImportFunction',
					'outputdynamicImportFunction',
					'this option is ignored for formats other than "es"'
				)
			);
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

		this.finaliseDynamicImports(options, snippets);
		this.finaliseImportMetas(format, snippets);

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
			const accessedGlobalVariables = this.accessedGlobalsByScope.get(module.scope);
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

		/* istanbul ignore next */
		if (!this.id) {
			throw new Error('Internal Error: expecting chunk id');
		}

		const magicString = finalise(
			this.renderedSource!,
			{
				accessedGlobals,
				dependencies: [...this.renderedDependencies!.values()],
				exports: this.renderedExports!,
				hasExports,
				id: this.id,
				indent: this.indentString,
				intro: addons.intro!,
				isEntryFacade:
					this.outputOptions.preserveModules ||
					(this.facadeModule !== null && this.facadeModule.info.isEntry),
				isModuleFacade: this.facadeModule !== null,
				namedExportsMode: this.exportMode !== 'default',
				outro: addons.outro!,
				snippets,
				usesTopLevelAwait,
				warn: this.inputOptions.onwarn
			},
			options
		);
		if (addons.banner) magicString.prepend(addons.banner);
		if (addons.footer) magicString.append(addons.footer);
		const prevCode = magicString.toString();

		timeEnd('render format', 2);

		let map: SourceMap = null as never;
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
			else if (options.dir) file = resolve(options.dir, this.id);
			else file = resolve(this.id);

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
						const newSourcePath = sourcemapPathTransform(sourcePath, `${file}.map`) as unknown;

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
		if (!options.compact && code[code.length - 1] !== '\n') code += '\n';
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
			this.name = this.outputOptions.sanitizeFileName(
				name || getChunkNameFromModule(facadedModule)
			);
		}
	}

	private checkCircularDependencyImport(variable: Variable, importingModule: Module) {
		const variableModule = variable.module;
		if (variableModule instanceof Module) {
			const exportChunk = this.chunkByModule.get(variableModule);
			let alternativeReexportModule;
			do {
				alternativeReexportModule = importingModule.alternativeReexportModules.get(variable);
				if (alternativeReexportModule) {
					const exportingChunk = this.chunkByModule.get(alternativeReexportModule);
					if (exportingChunk && exportingChunk !== exportChunk) {
						this.inputOptions.onwarn(
							errCyclicCrossChunkReexport(
								variableModule.getExportNamesByVariable().get(variable)![0],
								variableModule.id,
								alternativeReexportModule.id,
								importingModule.id
							)
						);
					}
					importingModule = alternativeReexportModule;
				}
			} while (alternativeReexportModule);
		}
	}

	private computeContentHashWithDependencies(
		addons: Addons,
		options: NormalizedOutputOptions,
		existingNames: Record<string, unknown>
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
				this.checkCircularDependencyImport(importedVariable, module);
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

	private finaliseDynamicImports(options: NormalizedOutputOptions, snippets: GenerateCodeSnippets) {
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
						chunk!.exportNamesByVariable.get(resolution.namespace)![0],
					snippets
				);
			}
		}
	}

	private finaliseImportMetas(format: InternalModuleFormat, snippets: GenerateCodeSnippets): void {
		for (const [module, code] of this.renderedModuleSources) {
			for (const importMeta of module.importMetas) {
				importMeta.renderFinalMechanism(code, this.id!, format, snippets, this.pluginDriver);
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
		options: NormalizedOutputOptions,
		getPropertyAccess: (name: string) => string
	): Map<Chunk | ExternalModule, ModuleDeclarationDependency> {
		const importSpecifiers = this.getImportSpecifiers(getPropertyAccess);
		const reexportSpecifiers = this.getReexportSpecifiers();
		const dependencyDeclaration = new Map<Chunk | ExternalModule, ModuleDeclarationDependency>();
		for (const dep of this.dependencies) {
			const imports = importSpecifiers.get(dep) || null;
			const reexports = reexportSpecifiers.get(dep) || null;
			const namedExportsMode = dep instanceof ExternalModule || dep.exportMode !== 'default';

			dependencyDeclaration.set(dep, {
				defaultVariableName: (dep as ExternalModule).defaultVariableName,
				globalName: (dep instanceof ExternalModule &&
					(options.format === 'umd' || options.format === 'iife') &&
					getGlobalName(
						dep,
						options.globals,
						(imports || reexports) !== null,
						this.inputOptions.onwarn
					)) as string,
				id: undefined as never, // chunk id updated on render
				imports,
				isChunk: dep instanceof Chunk,
				name: dep.variableName,
				namedExportsMode,
				namespaceVariableName: (dep as ExternalModule).namespaceVariableName,
				reexports
			});
		}

		return dependencyDeclaration;
	}

	private getChunkExportDeclarations(
		format: InternalModuleFormat,
		getPropertyAccess: (name: string) => string
	): ChunkExports {
		const exports: ChunkExports = [];
		for (const exportName of this.getExportNames()) {
			if (exportName[0] === '*') continue;

			const variable = this.exportsByName[exportName];
			if (!(variable instanceof SyntheticNamedExportVariable)) {
				const module = variable.module;
				if (module && this.chunkByModule.get(module as Module) !== this) continue;
			}
			let expression = null;
			let hoisted = false;
			let local = variable.getName(getPropertyAccess);
			if (variable instanceof LocalVariable) {
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
				if (format === 'es') {
					local = variable.renderName!;
				}
			}

			exports.push({
				exported: exportName,
				expression,
				hoisted,
				local
			});
		}
		return exports;
	}

	private getDependenciesToBeDeconflicted(
		addNonNamespacesAndInteropHelpers: boolean,
		addDependenciesWithoutBindings: boolean,
		interop: GetInterop
	): DependenciesToBeDeconflicted {
		const dependencies = new Set<Chunk | ExternalModule>();
		const deconflictedDefault = new Set<ExternalModule>();
		const deconflictedNamespace = new Set<Chunk | ExternalModule>();
		for (const variable of [...this.exportNamesByVariable.keys(), ...this.imports]) {
			if (addNonNamespacesAndInteropHelpers || variable.isNamespace) {
				const module = variable.module!;
				if (module instanceof ExternalModule) {
					dependencies.add(module);
					if (addNonNamespacesAndInteropHelpers) {
						if (variable.name === 'default') {
							if (defaultInteropHelpersByInteropType[String(interop(module.id))]) {
								deconflictedDefault.add(module);
							}
						} else if (variable.name === '*') {
							if (namespaceInteropHelpersByInteropType[String(interop(module.id))]) {
								deconflictedNamespace.add(module);
							}
						}
					}
				} else {
					const chunk = this.chunkByModule.get(module)!;
					if (chunk !== this) {
						dependencies.add(chunk);
						if (
							addNonNamespacesAndInteropHelpers &&
							chunk.exportMode === 'default' &&
							variable.isNamespace
						) {
							deconflictedNamespace.add(chunk);
						}
					}
				}
			}
		}
		if (addDependenciesWithoutBindings) {
			for (const dependency of this.dependencies) {
				dependencies.add(dependency);
			}
		}
		return { deconflictedDefault, deconflictedNamespace, dependencies };
	}

	private getFallbackChunkName(): string {
		if (this.manualChunkAlias) {
			return this.manualChunkAlias;
		}
		if (this.dynamicName) {
			return this.dynamicName;
		}
		if (this.fileName) {
			return getAliasName(this.fileName);
		}
		return getAliasName(this.orderedModules[this.orderedModules.length - 1].id);
	}

	private getImportSpecifiers(
		getPropertyAccess: (name: string) => string
	): Map<Chunk | ExternalModule, ImportSpecifier[]> {
		const { interop } = this.outputOptions;
		const importsByDependency = new Map<Chunk | ExternalModule, ImportSpecifier[]>();
		for (const variable of this.imports) {
			const module = variable.module!;
			let dependency: Chunk | ExternalModule;
			let imported: string;
			if (module instanceof ExternalModule) {
				dependency = module;
				imported = variable.name;
				if (imported !== 'default' && imported !== '*' && interop(module.id) === 'defaultOnly') {
					return error(errUnexpectedNamedImport(module.id, imported, false));
				}
			} else {
				dependency = this.chunkByModule.get(module)!;
				imported = dependency.getVariableExportName(variable);
			}
			getOrCreate(importsByDependency, dependency, () => []).push({
				imported,
				local: variable.getName(getPropertyAccess)
			});
		}
		return importsByDependency;
	}

	private getImportedBindingsPerDependency(): { [imported: string]: string[] } {
		const importSpecifiers: { [imported: string]: string[] } = {};
		for (const [dependency, declaration] of this.renderedDependencies!) {
			const specifiers = new Set<string>();
			if (declaration.imports) {
				for (const { imported } of declaration.imports) {
					specifiers.add(imported);
				}
			}
			if (declaration.reexports) {
				for (const { imported } of declaration.reexports) {
					specifiers.add(imported);
				}
			}
			importSpecifiers[dependency.id!] = [...specifiers];
		}
		return importSpecifiers;
	}

	private getReexportSpecifiers(): Map<Chunk | ExternalModule, ReexportSpecifier[]> {
		const { externalLiveBindings, interop } = this.outputOptions;
		const reexportSpecifiers = new Map<Chunk | ExternalModule, ReexportSpecifier[]>();
		for (let exportName of this.getExportNames()) {
			let dependency: Chunk | ExternalModule;
			let imported: string;
			let needsLiveBinding = false;
			if (exportName[0] === '*') {
				const id = exportName.substr(1);
				if (interop(id) === 'defaultOnly') {
					this.inputOptions.onwarn(errUnexpectedNamespaceReexport(id));
				}
				needsLiveBinding = externalLiveBindings;
				dependency = this.modulesById.get(id) as ExternalModule;
				imported = exportName = '*';
			} else {
				const variable = this.exportsByName[exportName];
				if (variable instanceof SyntheticNamedExportVariable) continue;
				const module = variable.module!;
				if (module instanceof Module) {
					dependency = this.chunkByModule.get(module)!;
					if (dependency === this) continue;
					imported = dependency.getVariableExportName(variable);
					needsLiveBinding = variable.isReassigned;
				} else {
					dependency = module;
					imported = variable.name;
					if (imported !== 'default' && imported !== '*' && interop(module.id) === 'defaultOnly') {
						return error(errUnexpectedNamedImport(module.id, imported, true));
					}
					needsLiveBinding =
						externalLiveBindings &&
						(imported !== 'default' || isDefaultAProperty(String(interop(module.id)), true));
				}
			}
			getOrCreate(reexportSpecifiers, dependency, () => []).push({
				imported,
				needsLiveBinding,
				reexported: exportName
			});
		}
		return reexportSpecifiers;
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

	private prepareModulesForRendering(snippets: GenerateCodeSnippets) {
		const accessedGlobalsByScope = this.accessedGlobalsByScope;
		for (const module of this.orderedModules) {
			for (const { node, resolution } of module.dynamicImports) {
				if (node.included) {
					if (resolution instanceof Module) {
						const chunk = this.chunkByModule.get(resolution);
						if (chunk === this) {
							node.setInternalResolution(resolution.namespace);
						} else {
							node.setExternalResolution(
								this.facadeChunkByModule.get(resolution)?.exportMode || chunk!.exportMode,
								resolution,
								this.outputOptions,
								snippets,
								this.pluginDriver,
								accessedGlobalsByScope
							);
						}
					} else {
						node.setExternalResolution(
							'external',
							resolution,
							this.outputOptions,
							snippets,
							this.pluginDriver,
							accessedGlobalsByScope
						);
					}
				}
			}
			for (const importMeta of module.importMetas) {
				importMeta.addAccessedGlobals(this.outputOptions.format, accessedGlobalsByScope);
			}
			if (this.includedNamespaces.has(module) && !this.outputOptions.preserveModules) {
				module.namespace.prepare(accessedGlobalsByScope);
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

	private setIdentifierRenderResolutions({
		format,
		interop,
		namespaceToStringTag
	}: NormalizedOutputOptions) {
		const syntheticExports = new Set<SyntheticNamedExportVariable>();
		for (const exportName of this.getExportNames()) {
			const exportVariable = this.exportsByName[exportName];
			if (
				format !== 'es' &&
				format !== 'system' &&
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
		for (const module of this.orderedModules) {
			if (module.needsExportShim) {
				this.needsExportsShim = true;
				break;
			}
		}
		const usedNames = new Set<string>(['Object', 'Promise']);
		if (this.needsExportsShim) {
			usedNames.add(MISSING_EXPORT_SHIM_VARIABLE);
		}
		if (namespaceToStringTag) {
			usedNames.add('Symbol');
		}
		switch (format) {
			case 'system':
				usedNames.add('module').add('exports');
				break;
			case 'es':
				break;
			case 'cjs':
				usedNames.add('module').add('require').add('__filename').add('__dirname');
			// fallthrough
			default:
				usedNames.add('exports');
				for (const helper of HELPER_NAMES) {
					usedNames.add(helper);
				}
		}

		deconflictChunk(
			this.orderedModules,
			this.getDependenciesToBeDeconflicted(
				format !== 'es' && format !== 'system',
				format === 'amd' || format === 'umd' || format === 'iife',
				interop
			),
			this.imports,
			usedNames,
			format,
			interop,
			this.outputOptions.preserveModules,
			this.outputOptions.externalLiveBindings,
			this.chunkByModule,
			syntheticExports,
			this.exportNamesByVariable,
			this.accessedGlobalsByScope,
			this.includedNamespaces
		);
	}

	private setUpChunkImportsAndExportsForModule(module: Module) {
		const moduleImports = new Set(module.imports);
		// when we are not preserving modules, we need to make all namespace variables available for
		// rendering the namespace object
		if (!this.outputOptions.preserveModules) {
			if (this.includedNamespaces.has(module)) {
				const memberVariables = module.namespace.getMemberVariables();
				for (const variable of Object.values(memberVariables)) {
					moduleImports.add(variable);
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
					this.checkCircularDependencyImport(variable, module);
				}
			}
		}
		if (
			this.includedNamespaces.has(module) ||
			(module.info.isEntry && module.preserveSignature !== false) ||
			module.includedDynamicImporters.some(importer => this.chunkByModule.get(importer) !== this)
		) {
			this.ensureReexportsAreAvailableForModule(module);
		}
		for (const { node, resolution } of module.dynamicImports) {
			if (
				node.included &&
				resolution instanceof Module &&
				this.chunkByModule.get(resolution) === this &&
				!this.includedNamespaces.has(resolution)
			) {
				this.includedNamespaces.add(resolution);
				this.ensureReexportsAreAvailableForModule(resolution);
			}
		}
	}
}

function getChunkNameFromModule(module: Module): string {
	return module.chunkName || getAliasName(module.id);
}
