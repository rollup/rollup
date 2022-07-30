import MagicString, { Bundle as MagicStringBundle, type SourceMap } from 'magic-string';
import { relative } from '../browser/src/path';
import ExternalChunk from './ExternalChunk';
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
	GetInterop,
	GlobalsOption,
	InternalModuleFormat,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputChunk,
	PreRenderedChunk,
	RenderedChunk,
	RenderedModule,
	WarningHandler
} from './rollup/types';
import type { PluginDriver } from './utils/PluginDriver';
import { createAddons } from './utils/addons';
import { deconflictChunk, type DependenciesToBeDeconflicted } from './utils/deconflictChunk';
import {
	errCyclicCrossChunkReexport,
	errEmptyChunk,
	errMissingGlobalName,
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
import { FILE_PLACEHOLDER, OutputBundleWithPlaceholders } from './utils/outputBundle';
import { basename, extname, isAbsolute, resolve } from './utils/path';
import { getAliasName, getImportPath } from './utils/relativeId';
import type { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

export interface ModuleDeclarations {
	dependencies: ChunkDependency[];
	exports: ChunkExports;
}

type PreliminaryFileName = PreliminaryFileNameWithPlaceholder | FixedPreliminaryFileName;

export interface ChunkRenderResult {
	chunk: Chunk;
	magicString: MagicStringBundle;
	preliminaryFileName: PreliminaryFileName;
	usedModules: Module[];
}

interface PreliminaryFileNameWithPlaceholder {
	fileName: string;
	hashPlaceholder: string;
}

interface FixedPreliminaryFileName {
	fileName: string;
	hashPlaceholder: null;
}

export type ResolvedDynamicImport = (
	| { chunk: Chunk; externalChunk: null; facadeChunk: Chunk | undefined; resolution: Module }
	| { chunk: null; externalChunk: ExternalChunk; facadeChunk: null; resolution: ExternalModule }
	| { chunk: null; externalChunk: null; facadeChunk: null; resolution: string | null }
) & { node: ImportExpression };

export interface ChunkDependency {
	defaultVariableName: string | undefined;
	globalName: string | false | undefined;
	importPath: string;
	imports: ImportSpecifier[] | null;
	isChunk: boolean;
	name: string;
	namedExportsMode: boolean;
	namespaceVariableName: string | undefined;
	reexports: ReexportSpecifier[] | null;
}

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

type RenderedDependencies = Map<Chunk | ExternalChunk, ChunkDependency>;

const NON_ASSET_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.mts', '.cjs', '.cts'];

function getGlobalName(
	chunk: ExternalChunk,
	globals: GlobalsOption,
	hasExports: boolean,
	warn: WarningHandler
): string | undefined {
	const globalName = typeof globals === 'function' ? globals(chunk.id) : globals[chunk.id];
	if (globalName) {
		return globalName;
	}

	if (hasExports) {
		warn(errMissingGlobalName(chunk.id, chunk.variableName));
		return chunk.variableName;
	}
}

export default class Chunk {
	// placeholder declaration, only relevant for ExternalChunk
	defaultVariableName?: undefined;
	readonly entryModules: Module[] = [];
	execIndex: number;
	exportMode: 'none' | 'named' | 'default' = 'named';
	facadeModule: Module | null = null;
	id: string | null = null;
	namespaceVariableName = '';
	suggestedVariableName: string;
	variableName = '';

	private readonly accessedGlobalsByScope = new Map<ChildScope, Set<string>>();
	private dependencies = new Set<Chunk | ExternalChunk>();
	private readonly dynamicEntryModules: Module[] = [];
	private dynamicName: string | null = null;
	private readonly exportNamesByVariable = new Map<Variable, string[]>();
	private readonly exports = new Set<Variable>();
	private readonly exportsByName = new Map<string, Variable>();
	private fileName: string | null = null;
	private implicitEntryModules: Module[] = [];
	private readonly implicitlyLoadedBefore = new Set<Chunk>();
	private readonly imports = new Set<Variable>();
	private includedDynamicImports: ResolvedDynamicImport[] | null = null;
	private readonly includedReexportsByModule = new Map<Module, Variable[]>();
	// This may be updated in the constructor
	private readonly isEmpty: boolean = true;
	private name: string | null = null;
	private needsExportsShim = false;
	private preRenderedChunkInfo: PreRenderedChunk | null = null;
	private preliminaryFileName: PreliminaryFileName | null = null;
	private renderedChunkInfo: RenderedChunk | null = null;
	private renderedDependencies: Map<Chunk | ExternalChunk, ChunkDependency> | null = null;
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
		private readonly chunkByModule: Map<Module, Chunk>,
		private readonly externalChunkByModule: ReadonlyMap<ExternalModule, ExternalChunk>,
		private readonly facadeChunkByModule: Map<Module, Chunk>,
		private readonly includedNamespaces: Set<Module>,
		private readonly manualChunkAlias: string | null,
		private readonly getPlaceholder: HashPlaceholderGenerator,
		private readonly bundle: OutputBundleWithPlaceholders,
		private readonly inputBase: string,
		private readonly snippets: GenerateCodeSnippets
	) {
		this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;
		const chunkModules = new Set(orderedModules);

		for (const module of orderedModules) {
			chunkByModule.set(module, this);
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
		chunkByModule: Map<Module, Chunk>,
		externalChunkByModule: ReadonlyMap<ExternalModule, ExternalChunk>,
		facadeChunkByModule: Map<Module, Chunk>,
		includedNamespaces: Set<Module>,
		facadedModule: Module,
		facadeName: FacadeName,
		getPlaceholder: HashPlaceholderGenerator,
		bundle: OutputBundleWithPlaceholders,
		inputBase: string,
		snippets: GenerateCodeSnippets
	): Chunk {
		const chunk = new Chunk(
			[],
			inputOptions,
			outputOptions,
			unsetOptions,
			pluginDriver,
			modulesById,
			chunkByModule,
			externalChunkByModule,
			facadeChunkByModule,
			includedNamespaces,
			null,
			getPlaceholder,
			bundle,
			inputBase,
			snippets
		);
		chunk.assignFacadeName(facadeName, facadedModule);
		if (!facadeChunkByModule.has(facadedModule)) {
			facadeChunkByModule.set(facadedModule, chunk);
		}
		for (const dependency of facadedModule.getDependenciesToBeIncluded()) {
			chunk.dependencies.add(
				dependency instanceof Module
					? chunkByModule.get(dependency)!
					: externalChunkByModule.get(dependency)!
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
					this.assignFacadeName(
						requiredFacades.shift()!,
						module,
						this.outputOptions.preserveModules
					);
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
						this.externalChunkByModule,
						this.facadeChunkByModule,
						this.includedNamespaces,
						module,
						facadeName,
						this.getPlaceholder,
						this.bundle,
						this.inputBase,
						this.snippets
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

	generateOutputChunk(
		code: string,
		map: SourceMap | null,
		hashesByPlaceholder: Map<string, string>
	): OutputChunk {
		const renderedChunkInfo = this.getRenderedChunkInfo();
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

	getFileName(): string {
		return this.preliminaryFileName?.fileName || this.getPreliminaryFileName().fileName;
	}

	getImportPath(importer: string): string {
		return escapeId(
			getImportPath(
				importer,
				this.getFileName(),
				this.outputOptions.format === 'amd' && !this.outputOptions.amd.forceJsExtensionForImports,
				true
			)
		);
	}

	getPreliminaryFileName(): PreliminaryFileName {
		if (this.preliminaryFileName) {
			return this.preliminaryFileName;
		}
		let fileName: string;
		let hashPlaceholder: string | null = null;
		const { chunkFileNames, entryFileNames, file, format, preserveModules } = this.outputOptions;
		if (file) {
			fileName = basename(file);
		} else if (this.fileName !== null) {
			fileName = this.fileName;
		} else {
			const [pattern, patternName] =
				preserveModules || this.facadeModule?.isUserDefinedEntryPoint
					? [entryFileNames, 'output.entryFileNames']
					: [chunkFileNames, 'output.chunkFileNames'];
			fileName = renderNamePattern(
				typeof pattern === 'function' ? pattern(this.getPreRenderedChunkInfo()) : pattern,
				patternName,
				{
					format: () => format,
					hash: size =>
						hashPlaceholder || (hashPlaceholder = this.getPlaceholder(patternName, size)),
					name: () => this.getChunkName()
				}
			);
			if (!hashPlaceholder) {
				fileName = makeUnique(fileName, this.bundle);
			}
		}
		if (!hashPlaceholder) {
			this.bundle[fileName] = FILE_PLACEHOLDER;
		}
		// Caching is essential to not conflict with the file name reservation above
		return (this.preliminaryFileName = { fileName, hashPlaceholder });
	}

	public getRenderedChunkInfo(): RenderedChunk {
		if (this.renderedChunkInfo) {
			return this.renderedChunkInfo;
		}
		const resolveFileName = (dependency: Chunk | ExternalChunk): string => dependency.getFileName();
		return (this.renderedChunkInfo = {
			...this.getPreRenderedChunkInfo(),
			dynamicImports: this.getDynamicDependencies().map(resolveFileName),
			fileName: this.getFileName(),
			implicitlyLoadedBefore: Array.from(this.implicitlyLoadedBefore, resolveFileName),
			importedBindings: getImportedBindingsPerDependency(
				this.getRenderedDependencies(),
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
		this.dependencies = getStaticDependencies(
			this,
			this.orderedModules,
			this.chunkByModule,
			this.externalChunkByModule
		);
		for (const module of this.orderedModules) {
			this.addImplicitlyLoadedBeforeFromModule(module);
			this.setUpChunkImportsAndExportsForModule(module);
		}
	}

	async render(): Promise<ChunkRenderResult> {
		const {
			dependencies,
			exportMode,
			facadeModule,
			inputOptions: { onwarn },
			outputOptions,
			pluginDriver,
			snippets
		} = this;
		const { format, hoistTransitiveImports, preserveModules } = outputOptions;

		// for static and dynamic entry points, add transitive dependencies to this
		// chunk's dependencies to avoid loading latency
		if (hoistTransitiveImports && !preserveModules && facadeModule !== null) {
			for (const dep of dependencies) {
				if (dep instanceof Chunk) this.inlineChunkDependencies(dep);
			}
		}

		const preliminaryFileName = this.getPreliminaryFileName();
		const { accessedGlobals, indent, magicString, renderedSource, usedModules, usesTopLevelAwait } =
			this.renderModules(preliminaryFileName.fileName);

		const renderedDependencies = [...this.getRenderedDependencies().values()];
		const renderedExports = exportMode === 'none' ? [] : this.getChunkExportDeclarations(format);
		const hasExports =
			renderedExports.length !== 0 ||
			renderedDependencies.some(dep => (dep.reexports && dep.reexports.length !== 0)!);

		const { intro, outro, banner, footer } = await createAddons(
			outputOptions,
			pluginDriver,
			this.getRenderedChunkInfo()
		);
		finalisers[format](
			renderedSource,
			{
				accessedGlobals,
				dependencies: renderedDependencies,
				exports: renderedExports,
				hasExports,
				id: preliminaryFileName.fileName,
				indent,
				intro,
				isEntryFacade: preserveModules || (facadeModule !== null && facadeModule.info.isEntry),
				isModuleFacade: facadeModule !== null,
				namedExportsMode: exportMode !== 'default',
				onwarn,
				outro,
				snippets,
				usesTopLevelAwait
			},
			outputOptions
		);
		if (banner) magicString.prepend(banner);
		if (footer) magicString.append(footer);

		return {
			chunk: this,
			magicString,
			preliminaryFileName,
			usedModules
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

	private assignFacadeName(
		{ fileName, name }: FacadeName,
		facadedModule: Module,
		preservePath?: boolean
	): void {
		if (fileName) {
			this.fileName = fileName;
		} else {
			this.name = this.outputOptions.sanitizeFileName(
				name ||
					(preservePath
						? this.getPreserveModulesChunkNameFromModule(facadedModule)
						: getChunkNameFromModule(facadedModule))
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

	private getChunkExportDeclarations(format: InternalModuleFormat): ChunkExports {
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
			let local = variable.getName(this.snippets.getPropertyAccess);
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
		const dependencies = new Set<Chunk | ExternalChunk>();
		const deconflictedDefault = new Set<ExternalChunk>();
		const deconflictedNamespace = new Set<Chunk | ExternalChunk>();
		for (const variable of [...this.exportNamesByVariable.keys(), ...this.imports]) {
			if (addNonNamespacesAndInteropHelpers || variable.isNamespace) {
				const module = variable.module!;
				if (module instanceof ExternalModule) {
					const chunk = this.externalChunkByModule.get(module)!;
					dependencies.add(chunk);
					if (addNonNamespacesAndInteropHelpers) {
						if (variable.name === 'default') {
							if (defaultInteropHelpersByInteropType[String(interop(module.id))]) {
								deconflictedDefault.add(chunk);
							}
						} else if (variable.name === '*') {
							if (namespaceInteropHelpersByInteropType[String(interop(module.id))]) {
								deconflictedNamespace.add(chunk);
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

	private getDynamicDependencies(): (Chunk | ExternalChunk)[] {
		return this.getIncludedDynamicImports()
			.map(
				resolvedDynamicImport =>
					resolvedDynamicImport.facadeChunk ||
					resolvedDynamicImport.chunk ||
					resolvedDynamicImport.externalChunk ||
					resolvedDynamicImport.resolution
			)
			.filter(
				(resolution): resolution is Chunk | ExternalChunk =>
					resolution !== this &&
					(resolution instanceof Chunk || resolution instanceof ExternalChunk)
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

	private getImportSpecifiers(): Map<Chunk | ExternalChunk, ImportSpecifier[]> {
		const { interop } = this.outputOptions;
		const importsByDependency = new Map<Chunk | ExternalChunk, ImportSpecifier[]>();
		for (const variable of this.imports) {
			const module = variable.module!;
			let dependency: Chunk | ExternalChunk;
			let imported: string;
			if (module instanceof ExternalModule) {
				dependency = this.externalChunkByModule.get(module)!;
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
				local: variable.getName(this.snippets.getPropertyAccess)
			});
		}
		return importsByDependency;
	}

	private getIncludedDynamicImports(): ResolvedDynamicImport[] {
		if (this.includedDynamicImports) {
			return this.includedDynamicImports;
		}
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
								externalChunk: null,
								facadeChunk: this.facadeChunkByModule.get(resolution),
								node,
								resolution
						  }
						: resolution instanceof ExternalModule
						? {
								chunk: null,
								externalChunk: this.externalChunkByModule.get(resolution)!,
								facadeChunk: null,
								node,
								resolution
						  }
						: { chunk: null, externalChunk: null, facadeChunk: null, node, resolution }
				);
			}
		}
		return (this.includedDynamicImports = includedDynamicImports);
	}

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

	private getPreserveModulesChunkNameFromModule(module: Module): string {
		const predefinedChunkName = getPredefinedChunkNameFromModule(module);
		if (predefinedChunkName) return predefinedChunkName;
		const { preserveModulesRoot, sanitizeFileName } = this.outputOptions;
		const sanitizedId = sanitizeFileName(module.id.split(QUERY_HASH_REGEX, 1)[0]);
		const extName = extname(sanitizedId);
		const idWithoutExtension = NON_ASSET_EXTENSIONS.includes(extName)
			? sanitizedId.slice(0, -extName.length)
			: sanitizedId;
		if (isAbsolute(idWithoutExtension)) {
			return preserveModulesRoot && resolve(idWithoutExtension).startsWith(preserveModulesRoot)
				? idWithoutExtension.slice(preserveModulesRoot.length).replace(/^[\\/]/, '')
				: relative(this.inputBase, idWithoutExtension);
		} else {
			return `_virtual/${basename(idWithoutExtension)}`;
		}
	}

	private getReexportSpecifiers(): Map<Chunk | ExternalChunk, ReexportSpecifier[]> {
		const { externalLiveBindings, interop } = this.outputOptions;
		const reexportSpecifiers = new Map<Chunk | ExternalChunk, ReexportSpecifier[]>();
		for (let exportName of this.getExportNames()) {
			let dependency: Chunk | ExternalChunk;
			let imported: string;
			let needsLiveBinding = false;
			if (exportName[0] === '*') {
				const id = exportName.substring(1);
				if (interop(id) === 'defaultOnly') {
					this.inputOptions.onwarn(errUnexpectedNamespaceReexport(id));
				}
				needsLiveBinding = externalLiveBindings;
				dependency = this.externalChunkByModule.get(this.modulesById.get(id) as ExternalModule)!;
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
					dependency = this.externalChunkByModule.get(module)!;
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

	private getRenderedDependencies(): RenderedDependencies {
		if (this.renderedDependencies) {
			return this.renderedDependencies;
		}
		const importSpecifiers = this.getImportSpecifiers();
		const reexportSpecifiers = this.getReexportSpecifiers();
		const renderedDependencies = new Map<Chunk | ExternalChunk, ChunkDependency>();
		const fileName = this.getFileName();
		for (const dep of this.dependencies) {
			const imports = importSpecifiers.get(dep) || null;
			const reexports = reexportSpecifiers.get(dep) || null;
			const namedExportsMode = dep instanceof ExternalChunk || dep.exportMode !== 'default';
			const importPath = dep.getImportPath(fileName);

			renderedDependencies.set(dep, {
				defaultVariableName: dep.defaultVariableName,
				globalName:
					dep instanceof ExternalChunk &&
					(this.outputOptions.format === 'umd' || this.outputOptions.format === 'iife') &&
					getGlobalName(
						dep,
						this.outputOptions.globals,
						(imports || reexports) !== null,
						this.inputOptions.onwarn
					),
				importPath,
				imports,
				isChunk: dep instanceof Chunk,
				name: dep.variableName,
				namedExportsMode,
				namespaceVariableName: dep.namespaceVariableName,
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

	// This method changes properties on the AST before rendering and must not be async
	private renderModules(fileName: string) {
		const {
			dependencies,
			exportNamesByVariable,
			includedNamespaces,
			inputOptions: { onwarn },
			isEmpty,
			orderedModules,
			outputOptions,
			pluginDriver,
			renderedModules,
			snippets
		} = this;
		const {
			compact,
			dynamicImportFunction,
			format,
			freeze,
			namespaceToStringTag,
			preserveModules
		} = outputOptions;
		const { _, n } = snippets;
		this.setDynamicImportResolutions(fileName);
		this.setImportMetaResolutions(fileName);
		this.setIdentifierRenderResolutions();

		const magicString = new MagicStringBundle({ separator: `${n}${n}` });
		const indent = getIndentString(orderedModules, outputOptions);
		const usedModules: Module[] = [];
		let hoistedSource = '';
		const accessedGlobals = new Set<string>();
		const renderedModuleSources = new Map<Module, MagicString>();

		const renderOptions: RenderOptions = {
			dynamicImportFunction,
			exportNamesByVariable,
			format,
			freeze,
			indent,
			namespaceToStringTag,
			pluginDriver,
			snippets
		};

		let usesTopLevelAwait = false;
		for (const module of orderedModules) {
			let renderedLength = 0;
			let source: MagicString | undefined;
			if (module.isIncluded() || includedNamespaces.has(module)) {
				const rendered = module.render(renderOptions);
				({ source } = rendered);
				usesTopLevelAwait ||= rendered.usesTopLevelAwait;
				renderedLength = source.length();
				if (renderedLength) {
					if (compact && source.lastLine().includes('//')) source.append('\n');
					renderedModuleSources.set(module, source);
					magicString.addSource(source);
					usedModules.push(module);
				}
				const namespace = module.namespace;
				if (includedNamespaces.has(module) && !preserveModules) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += n + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
				const accessedGlobalVariables = this.accessedGlobalsByScope.get(module.scope);
				if (accessedGlobalVariables) {
					for (const name of accessedGlobalVariables) {
						accessedGlobals.add(name);
					}
				}
			}
			const { renderedExports, removedExports } = module.getRenderedExports();
			renderedModules[module.id] = {
				get code() {
					return source?.toString() ?? null;
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

		if (isEmpty && this.getExportNames().length === 0 && dependencies.size === 0) {
			onwarn(errEmptyChunk(this.getChunkName()));
		}
		return { accessedGlobals, indent, magicString, renderedSource, usedModules, usesTopLevelAwait };
	}

	private setDynamicImportResolutions(fileName: string) {
		const { accessedGlobalsByScope, outputOptions, pluginDriver, snippets } = this;
		for (const resolvedDynamicImport of this.getIncludedDynamicImports()) {
			if (resolvedDynamicImport.chunk) {
				const { chunk, facadeChunk, node, resolution } = resolvedDynamicImport;
				if (chunk === this) {
					node.setInternalResolution(resolution.namespace);
				} else {
					node.setExternalResolution(
						(facadeChunk || chunk).exportMode,
						resolution,
						outputOptions,
						snippets,
						pluginDriver,
						accessedGlobalsByScope,
						`'${(facadeChunk || chunk).getImportPath(fileName)}'`,
						!facadeChunk?.strictFacade && chunk.exportNamesByVariable.get(resolution.namespace)![0]
					);
				}
			} else {
				const { resolution } = resolvedDynamicImport;
				resolvedDynamicImport.node.setExternalResolution(
					'external',
					resolution,
					outputOptions,
					snippets,
					pluginDriver,
					accessedGlobalsByScope,
					resolution instanceof ExternalModule
						? `'${this.externalChunkByModule.get(resolution)!.getImportPath(fileName)}'`
						: resolution || '',
					false
				);
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
			this.externalChunkByModule,
			syntheticExports,
			this.exportNamesByVariable,
			this.accessedGlobalsByScope,
			this.includedNamespaces
		);
	}

	private setImportMetaResolutions(fileName: string) {
		const {
			accessedGlobalsByScope,
			includedNamespaces,
			outputOptions: { format, preserveModules }
		} = this;
		for (const module of this.orderedModules) {
			for (const importMeta of module.importMetas) {
				importMeta.setResolution(format, accessedGlobalsByScope, fileName);
			}
			if (includedNamespaces.has(module) && !preserveModules) {
				module.namespace.prepare(accessedGlobalsByScope);
			}
		}
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
	return getPredefinedChunkNameFromModule(module) ?? getAliasName(module.id);
}

function getPredefinedChunkNameFromModule(module: Module): string {
	return (
		module.chunkNames.find(({ isUserDefined }) => isUserDefined)?.name ?? module.chunkNames[0]?.name
	);
}

function getImportedBindingsPerDependency(
	renderedDependencies: RenderedDependencies,
	resolveFileName: (dependency: Chunk | ExternalChunk) => string
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
