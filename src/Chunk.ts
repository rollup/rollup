import MagicString, { Bundle as MagicStringBundle, type SourceMap } from 'magic-string';
import { relative } from '../browser/path';
import ExternalModule from './ExternalModule';
import Module from './Module';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import FunctionDeclaration from './ast/nodes/FunctionDeclaration';
import ImportExpression from './ast/nodes/ImportExpression';
import type ChildScope from './ast/scopes/ChildScope';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import LocalVariable from './ast/variables/LocalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import SyntheticNamedExportVariable from './ast/variables/SyntheticNamedExportVariable';
import type Variable from './ast/variables/Variable';
import finalisers from './finalisers/index';
import type {
	DecodedSourceMapOrMissing,
	GetInterop,
	GlobalsOption,
	InternalModuleFormat,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundleWithPlaceholders,
	OutputChunk,
	PreRenderedChunk,
	RenderedChunk,
	RenderedModule,
	WarningHandler
} from './rollup/types';
import { FILE_PLACEHOLDER } from './utils/FileEmitter';
import type { PluginDriver } from './utils/PluginDriver';
import type { Addons } from './utils/addons';
import { collapseSourcemaps } from './utils/collapseSourcemaps';
import { deconflictChunk, type DependenciesToBeDeconflicted } from './utils/deconflictChunk';
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
import type { GenerateCodeSnippets } from './utils/generateCodeSnippets';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { getOrCreate } from './utils/getOrCreate';
import { getStaticDependencies } from './utils/getStaticDependencies';
import { HashPlaceholderGenerator, replacePlaceholders } from './utils/hashPlaceholders';
import { makeLegal } from './utils/identifierHelpers';
import {
	defaultInteropHelpersByInteropType,
	HELPER_NAMES,
	isDefaultAProperty,
	namespaceInteropHelpersByInteropType
} from './utils/interopHelpers';
import { basename, dirname, extname, isAbsolute, normalize, resolve } from './utils/path';
import relativeId, { getAliasName, getImportPath } from './utils/relativeId';
import { transformChunk } from './utils/renderChunk';
import type { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { timeEnd, timeStart } from './utils/timers';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

// TODO Lukas ideally, the finally generated bundle does not contain getters so that memory can be freed when bundles are retained
// TODO Lukas in the end, make as much private as possible and thing about extracting the rendering logic
export interface ModuleDeclarations {
	dependencies: ModuleDeclarationDependency[];
	exports: ChunkExports;
}

type PreliminaryFileName = PreliminaryFileNameWithPlaceholder | FixedPreliminaryFileName;

interface PreliminaryFileNameWithPlaceholder {
	fileName: string;
	hashPlaceholder: string;
}

interface FixedPreliminaryFileName {
	fileName: string;
	hashPlaceholder: null;
}

export interface RenderedChunkWithPlaceholders {
	chunk: Chunk;
	code: string;
	map: SourceMap | null;
	preliminaryFileName: PreliminaryFileName;
}

type ResolvedDynamicImport = (
	| { chunk: Chunk; facadeChunk: Chunk | undefined; resolution: Module }
	| { chunk: null; facadeChunk: null; resolution: ExternalModule | string | null }
) & { node: ImportExpression };

export interface ModuleDeclarationDependency {
	defaultVariableName: string | undefined;
	globalName: string;
	// TODO Lukas this is probably not an id but a relative import path, rename
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

type RenderedDependencies = Map<Chunk | ExternalModule, ModuleDeclarationDependency>;

const NON_ASSET_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getGlobalName(
	module: ExternalModule,
	globals: GlobalsOption,
	hasExports: boolean,
	warn: WarningHandler
): string | undefined {
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
	readonly entryModules: Module[] = [];
	execIndex: number;
	exportMode: 'none' | 'named' | 'default' = 'named';
	facadeModule: Module | null = null;
	id: string | null = null;
	namespaceVariableName = '';
	needsExportsShim = false;
	suggestedVariableName: string;
	variableName = '';

	private readonly accessedGlobalsByScope = new Map<ChildScope, Set<string>>();
	private dependencies = new Set<ExternalModule | Chunk>();
	private readonly dynamicEntryModules: Module[] = [];
	private dynamicName: string | null = null;
	private readonly exportNamesByVariable = new Map<Variable, string[]>();
	private readonly exports = new Set<Variable>();
	private readonly exportsByName = new Map<string, Variable>();
	private fileName: string | null = null;
	private implicitEntryModules: Module[] = [];
	private readonly implicitlyLoadedBefore = new Set<Chunk>();
	private readonly imports = new Set<Variable>();
	private readonly includedReexportsByModule = new Map<Module, Variable[]>();
	private indentString: string = undefined as never;
	// This may only be updated in the constructor
	private readonly isEmpty: boolean = true;
	private name: string | null = null;
	private preRenderedChunkInfo: PreRenderedChunk | null = null;
	private preliminaryFileName: PreliminaryFileName | null = null;
	private renderedChunkInfo: RenderedChunk | null = null;
	// TODO Lukas if necessary, move caching into getter
	private renderedDependencies: Map<Chunk | ExternalModule, ModuleDeclarationDependency> | null =
		null;
	private readonly renderedModules: {
		[moduleId: string]: RenderedModule;
	} = Object.create(null);
	private sortedExportNames: string[] | null = null;
	private strictFacade = false;

	constructor(
		private readonly orderedModules: readonly Module[],
		private readonly inputOptions: NormalizedInputOptions,
		private readonly outputOptions: NormalizedOutputOptions,
		private readonly unsetOptions: ReadonlySet<string>,
		private readonly pluginDriver: PluginDriver,
		private readonly modulesById: ReadonlyMap<string, Module | ExternalModule>,
		private readonly chunkByModule: ReadonlyMap<Module, Chunk>,
		private readonly facadeChunkByModule: Map<Module, Chunk>,
		private readonly includedNamespaces: Set<Module>,
		private readonly manualChunkAlias: string | null,
		private readonly getPlaceholder: HashPlaceholderGenerator,
		private readonly bundle: OutputBundleWithPlaceholders
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
		unsetOptions: ReadonlySet<string>,
		pluginDriver: PluginDriver,
		modulesById: ReadonlyMap<string, Module | ExternalModule>,
		chunkByModule: ReadonlyMap<Module, Chunk>,
		facadeChunkByModule: Map<Module, Chunk>,
		includedNamespaces: Set<Module>,
		facadedModule: Module,
		facadeName: FacadeName,
		getPlaceholder: HashPlaceholderGenerator,
		bundle: OutputBundleWithPlaceholders
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
			null,
			getPlaceholder,
			bundle
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
			facadedModule.info.moduleSideEffects &&
			facadedModule.hasEffects()
		) {
			chunk.dependencies.add(chunkByModule.get(facadedModule)!);
		}
		chunk.ensureReexportsAreAvailableForModule(facadedModule);
		chunk.facadeModule = facadedModule;
		chunk.strictFacade = true;
		return chunk;
	}

	canModuleBeFacade(module: Module, exposedVariables: ReadonlySet<Variable>): boolean {
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
					this.exportsByName.set(exportName, variable);
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
			this.dynamicEntryModules.map(({ namespace }) => namespace)
		);
		for (const module of entryModules) {
			if (module.preserveSignature) {
				for (const exportedVariable of module.getExportNamesByVariable().keys()) {
					exposedVariables.add(exportedVariable);
				}
			}
		}
		for (const module of entryModules) {
			const requiredFacades: FacadeName[] = Array.from(
				new Set(
					module.chunkNames.filter(({ isUserDefined }) => isUserDefined).map(({ name }) => name)
				),
				// mapping must run after Set 'name' dedupe
				name => ({
					name
				})
			);
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
						facadeName,
						this.getPlaceholder,
						this.bundle
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
		if (!this.outputOptions.preserveModules) {
			this.addNecessaryImportsForFacades();
		}
		return facades;
	}

	// TODO Lukas store snippets/property access on the chunk
	generateOutputChunk(
		code: string,
		map: SourceMap | null,
		hashesByPlaceholder: Map<string, string>,
		inputBase: string,
		getPropertyAccess: (name: string) => string
	): OutputChunk {
		const renderedChunkInfo = this.getRenderedChunkInfo(inputBase, getPropertyAccess);
		const finalize = (code: string) => replacePlaceholders(code, hashesByPlaceholder);
		return {
			...renderedChunkInfo,
			code,
			dynamicImports: renderedChunkInfo.dynamicImports.map(finalize),
			fileName: finalize(renderedChunkInfo.fileName),
			implicitlyLoadedBefore: renderedChunkInfo.implicitlyLoadedBefore.map(finalize),
			importedBindings: Object.fromEntries(
				Object.entries(renderedChunkInfo.importedBindings).map(([fileName, bindings]) => [
					finalize(fileName),
					bindings
				])
			),
			imports: renderedChunkInfo.imports.map(finalize),
			map,
			referencedFiles: renderedChunkInfo.referencedFiles.map(finalize)
		};
	}

	getChunkName(): string {
		return (this.name ??= this.outputOptions.sanitizeFileName(this.getFallbackChunkName()));
	}

	getExportNames(): string[] {
		return (this.sortedExportNames ??= Array.from(this.exportsByName.keys()).sort());
	}

	getPreliminaryFileName(inputBase: string): PreliminaryFileName {
		if (this.preliminaryFileName) {
			return this.preliminaryFileName;
		}
		let fileName: string;
		let hashPlaceholder: string | null = null;
		const { chunkFileNames, entryFileNames, file, format, preserveModules } = this.outputOptions;
		if (file) {
			fileName = basename(file);
		} else if (preserveModules) {
			fileName = this.generateIdPreserveModules(inputBase);
		} else if (this.fileName !== null) {
			fileName = this.fileName;
		} else {
			const [pattern, patternName] =
				this.facadeModule && this.facadeModule.isUserDefinedEntryPoint
					? [entryFileNames, 'output.entryFileNames']
					: [chunkFileNames, 'output.chunkFileNames'];
			fileName = makeUnique(
				renderNamePattern(
					typeof pattern === 'function' ? pattern(this.getPreRenderedChunkInfo()) : pattern,
					patternName,
					{
						format: () => format,
						hash: () => hashPlaceholder || (hashPlaceholder = this.getPlaceholder(this, 8)),
						name: () => this.getChunkName()
					}
				),
				this.bundle
			);
		}
		// TODO Lukas test double placeholder
		if (!hashPlaceholder) {
			this.bundle[fileName] = FILE_PLACEHOLDER;
		}
		// Caching is essential to not conflict with the file name reservation above
		return (this.preliminaryFileName = { fileName, hashPlaceholder });
	}

	// TODO Lukas find a better solution for inputBase
	public getRenderedChunkInfo(
		inputBase: string,
		getPropertyAccess: (name: string) => string
	): RenderedChunk {
		if (this.renderedChunkInfo) {
			return this.renderedChunkInfo;
		}
		const { fileName } = this.getPreliminaryFileName(inputBase);
		const resolveFileName = (dependency: Chunk | ExternalModule): string =>
			dependency instanceof ExternalModule
				? dependency.getImportPath(fileName, this.outputOptions, inputBase).fileName
				: dependency.getPreliminaryFileName(inputBase).fileName;
		return (this.renderedChunkInfo = {
			...this.getPreRenderedChunkInfo(),
			dynamicImports: this.getDynamicDependencies().map(resolveFileName),
			fileName,
			implicitlyLoadedBefore: Array.from(this.implicitlyLoadedBefore, resolveFileName),
			importedBindings: getImportedBindingsPerDependency(
				this.getRenderedDependencies(inputBase, getPropertyAccess),
				resolveFileName
			),
			imports: Array.from(this.dependencies, resolveFileName),
			modules: this.renderedModules,
			referencedFiles: this.getReferencedFiles()
		});
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
			this.addImplicitlyLoadedBeforeFromModule(module);
			this.setUpChunkImportsAndExportsForModule(module);
		}
	}

	// TODO Lukas reduce "this" usage via destructuring
	render(inputBase: string, addons: Addons, snippets: GenerateCodeSnippets) {
		const {
			compact,
			dynamicImportFunction,
			format,
			freeze,
			hoistTransitiveImports,
			namespaceToStringTag,
			preserveModules
		} = this.outputOptions;
		// TODO Lukas move to output option generation
		if (dynamicImportFunction && format !== 'es') {
			this.inputOptions.onwarn(
				errInvalidOption(
					'output.dynamicImportFunction',
					'outputdynamicImportFunction',
					'this option is ignored for formats other than "es"'
				)
			);
		}

		// for static and dynamic entry points, inline the execution list to avoid loading latency
		// TODO Lukas this just extends the dependencies of the current chunk
		if (hoistTransitiveImports && !preserveModules && this.facadeModule !== null) {
			for (const dep of this.dependencies) {
				if (dep instanceof Chunk) this.inlineChunkDependencies(dep);
			}
		}

		// The next two steps are stateful. No other render should happen between this and actual rendering
		// TODO Lukas extract stateful sync part into separate sync function
		const accessedGlobalsByScope = this.accessedGlobalsByScope;
		const preliminaryFileName = this.getPreliminaryFileName(inputBase);

		// Set dynamic import resolutions
		for (const resolvedDynamicImport of this.getIncludedDynamicImports()) {
			if (resolvedDynamicImport.chunk) {
				const { chunk, facadeChunk, node, resolution } = resolvedDynamicImport;
				if (chunk === this) {
					node.setInternalResolution(resolution.namespace);
				} else {
					node.setExternalResolution(
						(facadeChunk || chunk).exportMode,
						resolution,
						this.outputOptions,
						snippets,
						this.pluginDriver,
						accessedGlobalsByScope,
						`'${escapeId(
							getImportPath(
								preliminaryFileName.fileName,
								(facadeChunk || chunk).getPreliminaryFileName(inputBase).fileName,
								this.outputOptions.format === 'amd',
								true
							)
						)}'`,
						!facadeChunk?.strictFacade && chunk.exportNamesByVariable.get(resolution.namespace)![0]
					);
				}
			} else {
				const { resolution } = resolvedDynamicImport;
				resolvedDynamicImport.node.setExternalResolution(
					'external',
					resolution,
					this.outputOptions,
					snippets,
					this.pluginDriver,
					accessedGlobalsByScope,
					resolution instanceof ExternalModule
						? `'${
								resolution.getImportPath(
									preliminaryFileName.fileName,
									this.outputOptions,
									inputBase
								).import
						  }'`
						: resolution || '',
					false
				);
			}
		}

		for (const module of this.orderedModules) {
			for (const importMeta of module.importMetas) {
				importMeta.setResolution(
					this.outputOptions.format,
					accessedGlobalsByScope,
					preliminaryFileName.fileName
				);
			}
			if (this.includedNamespaces.has(module) && !this.outputOptions.preserveModules) {
				module.namespace.prepare(accessedGlobalsByScope);
			}
		}

		this.setIdentifierRenderResolutions();

		const { _, getPropertyAccess, n } = snippets;
		const magicString = new MagicStringBundle({ separator: `${n}${n}` });
		this.indentString = getIndentString(this.orderedModules, this.outputOptions);
		const usedModules: Module[] = [];
		let hoistedSource = '';

		const renderOptions: RenderOptions = {
			dynamicImportFunction,
			exportNamesByVariable: this.exportNamesByVariable,
			format,
			freeze,
			indent: this.indentString,
			namespaceToStringTag,
			outputPluginDriver: this.pluginDriver,
			snippets
		};

		const renderedModules = this.renderedModules;
		const renderedModuleSources = new Map<Module, MagicString>();
		for (const module of this.orderedModules) {
			let renderedLength = 0;
			if (module.isIncluded() || this.includedNamespaces.has(module)) {
				const source = module.render(renderOptions).trim();
				renderedLength = source.length();
				if (renderedLength) {
					if (compact && source.lastLine().includes('//')) source.append('\n');
					renderedModuleSources.set(module, source);
					magicString.addSource(source);
					usedModules.push(module);
				}
				const namespace = module.namespace;
				if (this.includedNamespaces.has(module) && !this.outputOptions.preserveModules) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += n + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
			}
			const { renderedExports, removedExports } = module.getRenderedExports();
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
		const renderedSource = compact ? magicString : magicString.trim();

		if (this.isEmpty && this.getExportNames().length === 0 && this.dependencies.size === 0) {
			const chunkName = this.getChunkName();
			this.inputOptions.onwarn({
				chunkName,
				code: 'EMPTY_BUNDLE',
				message: `Generated an empty chunk: "${chunkName}"`
			});
		}

		const renderedDependencies = this.getRenderedDependencies(inputBase, getPropertyAccess);
		const renderedExports =
			this.exportMode === 'none' ? [] : this.getChunkExportDeclarations(format, getPropertyAccess);

		timeStart('render format', 2);
		const finalise = finalisers[format];

		const hasExports =
			renderedExports.length !== 0 ||
			[...renderedDependencies.values()].some(
				dep => (dep.reexports && dep.reexports.length !== 0)!
			);

		let topLevelAwaitModule: string | null = null;
		const accessedGlobals = new Set<string>();
		for (const module of this.orderedModules) {
			if (module.usesTopLevelAwait) {
				topLevelAwaitModule = module.id;
			}
			const accessedGlobalVariables = this.accessedGlobalsByScope.get(module.scope);
			if (accessedGlobalVariables) {
				for (const name of accessedGlobalVariables) {
					accessedGlobals.add(name);
				}
			}
		}

		if (topLevelAwaitModule !== null && format !== 'es' && format !== 'system') {
			return error({
				code: 'INVALID_TLA_FORMAT',
				id: topLevelAwaitModule,
				message: `Module format ${format} does not support top-level await. Use the "es" or "system" output formats rather.`
			});
		}

		// TODO Lukas we do not need to return magicString from finalisers
		finalise(
			renderedSource,
			{
				accessedGlobals,
				dependencies: [...renderedDependencies.values()],
				exports: renderedExports,
				hasExports,
				// TODO Lukas this is only needed for AMD ids here. If we replace this with a getter, we can either use the actual id or an id with hash placeholder; in the latter case, this module becomes a module with placeholder dependency
				id: preliminaryFileName.fileName,
				indent: this.indentString,
				intro: addons.intro,
				isEntryFacade:
					this.outputOptions.preserveModules ||
					(this.facadeModule !== null && this.facadeModule.info.isEntry),
				isModuleFacade: this.facadeModule !== null,
				namedExportsMode: this.exportMode !== 'default',
				outro: addons.outro,
				snippets,
				usesTopLevelAwait: topLevelAwaitModule !== null,
				warn: this.inputOptions.onwarn
			},
			this.outputOptions
		);
		if (addons.banner) magicString.prepend(addons.banner);
		if (addons.footer) magicString.append(addons.footer);
		timeEnd('render format', 2);

		return { chunk: this, magicString, usedModules };
	}

	public async transform(
		magicString: MagicStringBundle,
		usedModules: Module[],
		chunks: Record<string, RenderedChunk>,
		inputBase: string,
		getPropertyAccess: (name: string) => string
	) {
		let map: SourceMap | null = null;
		const chunkSourcemapChain: DecodedSourceMapOrMissing[] = [];
		// TODO Lukas test that in renderChunk, we can also mutate imports etc. as they are updated
		let code = await transformChunk({
			chunks,
			code: magicString.toString(),
			options: this.outputOptions,
			outputPluginDriver: this.pluginDriver,
			renderChunk: this.getRenderedChunkInfo(inputBase, getPropertyAccess),
			sourcemapChain: chunkSourcemapChain
		});
		if (!this.outputOptions.compact && code[code.length - 1] !== '\n') code += '\n';
		const preliminaryFileName = this.getPreliminaryFileName(inputBase);
		const { fileName } = preliminaryFileName;

		// TODO Lukas we also need to replace hash placeholders in the source maps
		if (this.outputOptions.sourcemap) {
			timeStart('sourcemap', 2);

			let file: string;
			if (this.outputOptions.file)
				file = resolve(this.outputOptions.sourcemapFile || this.outputOptions.file);
			else if (this.outputOptions.dir) file = resolve(this.outputOptions.dir, fileName);
			else file = resolve(fileName);

			const decodedMap = magicString.generateDecodedMap({});
			map = collapseSourcemaps(
				file,
				decodedMap,
				usedModules,
				chunkSourcemapChain,
				this.outputOptions.sourcemapExcludeSources,
				this.inputOptions.onwarn
			);
			map.sources = map.sources
				.map(sourcePath => {
					const { sourcemapPathTransform } = this.outputOptions;

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
		return {
			chunk: this,
			code,
			map,
			preliminaryFileName
		};
	}

	private addImplicitlyLoadedBeforeFromModule(baseModule: Module): void {
		const { implicitlyLoadedBefore } = this;
		for (const module of baseModule.implicitlyLoadedBefore) {
			const chunk = this.chunkByModule.get(module);
			if (chunk && chunk !== this) {
				implicitlyLoadedBefore.add(chunk);
			}
		}
	}

	private addNecessaryImportsForFacades() {
		for (const [module, variables] of this.includedReexportsByModule) {
			if (this.includedNamespaces.has(module)) {
				for (const variable of variables) {
					this.imports.add(variable);
				}
			}
		}
	}

	private assignFacadeName({ fileName, name }: FacadeName, facadedModule: Module): void {
		if (fileName) {
			this.fileName = fileName;
		} else {
			this.name = this.outputOptions.sanitizeFileName(
				name || getChunkNameFromModule(facadedModule)
			);
		}
	}

	private checkCircularDependencyImport(variable: Variable, importingModule: Module): void {
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

	private ensureReexportsAreAvailableForModule(module: Module): void {
		const includedReexports: Variable[] = [];
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
						includedReexports.push(importedVariable);
						if (isSynthetic) {
							this.imports.add(importedVariable);
						}
					}
				}
			}
		}
		if (includedReexports.length) {
			this.includedReexportsByModule.set(module, includedReexports);
		}
	}

	private generateIdPreserveModules(inputBase: string): string {
		const [{ id }] = this.orderedModules;
		const { entryFileNames, format, preserveModulesRoot, sanitizeFileName } = this.outputOptions;
		const sanitizedId = sanitizeFileName(id.split(QUERY_HASH_REGEX, 1)[0]);
		let path: string;

		const patternOpt = this.unsetOptions.has('entryFileNames')
			? '[name][assetExtname].js'
			: entryFileNames;
		const pattern =
			typeof patternOpt === 'function' ? patternOpt(this.getPreRenderedChunkInfo()) : patternOpt;

		if (isAbsolute(sanitizedId)) {
			const currentDir = dirname(sanitizedId);
			const extension = extname(sanitizedId);
			const fileName = renderNamePattern(pattern, 'output.entryFileNames', {
				assetExtname: () => (NON_ASSET_EXTENSIONS.includes(extension) ? '' : extension),
				ext: () => extension.substring(1),
				extname: () => extension,
				format: () => format as string,
				name: () => this.getChunkName()
			});
			const currentPath = `${currentDir}/${fileName}`;
			if (preserveModulesRoot && currentPath.startsWith(preserveModulesRoot)) {
				path = currentPath.slice(preserveModulesRoot.length).replace(/^[\\/]/, '');
			} else {
				path = relative(inputBase, currentPath);
			}
		} else {
			const extension = extname(sanitizedId);
			const fileName = renderNamePattern(pattern, 'output.entryFileNames', {
				assetExtname: () => (NON_ASSET_EXTENSIONS.includes(extension) ? '' : extension),
				ext: () => extension.substring(1),
				extname: () => extension,
				format: () => format as string,
				name: () => getAliasName(sanitizedId)
			});
			path = `_virtual/${fileName}`;
		}
		return makeUnique(normalize(path), this.bundle);
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
			return getChunkNameFromModule(moduleForNaming);
		}
		return 'chunk';
	}

	private getChunkExportDeclarations(
		format: InternalModuleFormat,
		getPropertyAccess: (name: string) => string
	): ChunkExports {
		const exports: ChunkExports = [];
		for (const exportName of this.getExportNames()) {
			if (exportName[0] === '*') continue;

			const variable = this.exportsByName.get(exportName)!;
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

	// TODO Lukas consider caching if relevant
	private getDynamicDependencies(): (Chunk | ExternalModule)[] {
		return this.getIncludedDynamicImports()
			.map(
				resolvedDynamicImport =>
					resolvedDynamicImport.facadeChunk ||
					resolvedDynamicImport.chunk ||
					resolvedDynamicImport.resolution
			)
			.filter(
				(resolution): resolution is Chunk | ExternalModule =>
					(resolution instanceof Chunk || resolution instanceof ExternalModule) &&
					resolution !== this
			);
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

	// TODO Lukas possibly add caching
	private getIncludedDynamicImports(): ResolvedDynamicImport[] {
		const includedDynamicImports: ResolvedDynamicImport[] = [];
		for (const module of this.orderedModules) {
			for (const { node, resolution } of module.dynamicImports) {
				if (!node.included) {
					continue;
				}
				includedDynamicImports.push(
					resolution instanceof Module
						? {
								chunk: this.chunkByModule.get(resolution)!,
								facadeChunk: this.facadeChunkByModule.get(resolution),
								node,
								resolution
						  }
						: { chunk: null, facadeChunk: null, node, resolution }
				);
			}
		}
		return includedDynamicImports;
	}

	// TODO Lukas only create once?
	private getPreRenderedChunkInfo(): PreRenderedChunk {
		if (this.preRenderedChunkInfo) {
			return this.preRenderedChunkInfo;
		}
		const { facadeModule } = this;
		return (this.preRenderedChunkInfo = {
			exports: this.getExportNames(),
			facadeModuleId: facadeModule && facadeModule.id,
			isDynamicEntry: this.dynamicEntryModules.length > 0,
			isEntry: !!facadeModule?.info.isEntry,
			isImplicitEntry: this.implicitEntryModules.length > 0,
			moduleIds: this.orderedModules.map(({ id }) => id),
			name: this.getChunkName(),
			type: 'chunk'
		});
	}

	private getReexportSpecifiers(): Map<Chunk | ExternalModule, ReexportSpecifier[]> {
		const { externalLiveBindings, interop } = this.outputOptions;
		const reexportSpecifiers = new Map<Chunk | ExternalModule, ReexportSpecifier[]>();
		for (let exportName of this.getExportNames()) {
			let dependency: Chunk | ExternalModule;
			let imported: string;
			let needsLiveBinding = false;
			if (exportName[0] === '*') {
				const id = exportName.substring(1);
				if (interop(id) === 'defaultOnly') {
					this.inputOptions.onwarn(errUnexpectedNamespaceReexport(id));
				}
				needsLiveBinding = externalLiveBindings;
				dependency = this.modulesById.get(id) as ExternalModule;
				imported = exportName = '*';
			} else {
				const variable = this.exportsByName.get(exportName)!;
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
		const referencedFiles = new Set<string>();
		for (const module of this.orderedModules) {
			for (const meta of module.importMetas) {
				const fileName = meta.getReferencedFileName(this.pluginDriver);
				if (fileName) {
					referencedFiles.add(fileName);
				}
			}
		}
		return [...referencedFiles];
	}

	private getRenderedDependencies(
		inputBase: string,
		getPropertyAccess: (name: string) => string
	): RenderedDependencies {
		if (this.renderedDependencies) {
			return this.renderedDependencies;
		}
		const importSpecifiers = this.getImportSpecifiers(getPropertyAccess);
		const reexportSpecifiers = this.getReexportSpecifiers();
		const renderedDependencies = new Map<Chunk | ExternalModule, ModuleDeclarationDependency>();
		const { fileName } = this.getPreliminaryFileName(inputBase);
		for (const dep of this.dependencies) {
			const imports = importSpecifiers.get(dep) || null;
			const reexports = reexportSpecifiers.get(dep) || null;
			const namedExportsMode = dep instanceof ExternalModule || dep.exportMode !== 'default';
			// TODO Lukas see how we can cache things?
			const id =
				dep instanceof ExternalModule
					? dep.getImportPath(fileName, this.outputOptions, inputBase).import
					: escapeId(
							getImportPath(fileName, dep.getPreliminaryFileName(inputBase).fileName, false, true)
					  );

			renderedDependencies.set(dep, {
				defaultVariableName: (dep as ExternalModule).defaultVariableName,
				// TODO Lukas globalName should probably not be typed as string?
				globalName: (dep instanceof ExternalModule &&
					(this.outputOptions.format === 'umd' || this.outputOptions.format === 'iife') &&
					getGlobalName(
						dep,
						this.outputOptions.globals,
						(imports || reexports) !== null,
						this.inputOptions.onwarn
					)) as string,
				id,
				imports,
				isChunk: dep instanceof Chunk,
				name: dep.variableName,
				namedExportsMode,
				namespaceVariableName: (dep as ExternalModule).namespaceVariableName,
				reexports
			});
		}

		return (this.renderedDependencies = renderedDependencies);
	}

	private inlineChunkDependencies(chunk: Chunk): void {
		for (const dep of chunk.dependencies) {
			if (this.dependencies.has(dep)) continue;
			this.dependencies.add(dep);
			if (dep instanceof Chunk) {
				this.inlineChunkDependencies(dep);
			}
		}
	}

	private setIdentifierRenderResolutions() {
		const { format, interop, namespaceToStringTag } = this.outputOptions;
		const syntheticExports = new Set<SyntheticNamedExportVariable>();
		for (const exportName of this.getExportNames()) {
			const exportVariable = this.exportsByName.get(exportName)!;
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
		const usedNames = new Set(['Object', 'Promise']);
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

	private setUpChunkImportsAndExportsForModule(module: Module): void {
		const moduleImports = new Set(module.includedImports);
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
	return (
		module.chunkNames.find(({ isUserDefined }) => isUserDefined)?.name ??
		module.chunkNames[0]?.name ??
		getAliasName(module.id)
	);
}

function getImportedBindingsPerDependency(
	renderedDependencies: RenderedDependencies,
	resolveFileName: (dependency: Chunk | ExternalModule) => string
): {
	[imported: string]: string[];
} {
	const importedBindingsPerDependency: { [imported: string]: string[] } = {};
	for (const [dependency, declaration] of renderedDependencies) {
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
		importedBindingsPerDependency[resolveFileName(dependency)] = [...specifiers];
	}
	return importedBindingsPerDependency;
}

const QUERY_HASH_REGEX = /[?#]/;
