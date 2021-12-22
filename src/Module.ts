import { extractAssignedNames } from '@rollup/pluginutils';
import * as acorn from 'acorn';
import { locate } from 'locate-character';
import MagicString from 'magic-string';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import { createHasEffectsContext, createInclusionContext } from './ast/ExecutionContext';
import ExportAllDeclaration from './ast/nodes/ExportAllDeclaration';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import ExportNamedDeclaration from './ast/nodes/ExportNamedDeclaration';
import Identifier from './ast/nodes/Identifier';
import ImportDeclaration from './ast/nodes/ImportDeclaration';
import ImportExpression from './ast/nodes/ImportExpression';
import ImportSpecifier from './ast/nodes/ImportSpecifier';
import Literal from './ast/nodes/Literal';
import MetaProperty from './ast/nodes/MetaProperty';
import * as NodeType from './ast/nodes/NodeType';
import Program from './ast/nodes/Program';
import TemplateLiteral from './ast/nodes/TemplateLiteral';
import VariableDeclaration from './ast/nodes/VariableDeclaration';
import { nodeConstructors } from './ast/nodes/index';
import { ExpressionNode, NodeBase } from './ast/nodes/shared/Node';
import ModuleScope from './ast/scopes/ModuleScope';
import { PathTracker, UNKNOWN_PATH } from './ast/utils/PathTracker';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import ExportShimVariable from './ast/variables/ExportShimVariable';
import ExternalVariable from './ast/variables/ExternalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import SyntheticNamedExportVariable from './ast/variables/SyntheticNamedExportVariable';
import Variable from './ast/variables/Variable';
import {
	CustomPluginOptions,
	DecodedSourceMapOrMissing,
	EmittedFile,
	ExistingDecodedSourceMap,
	ModuleInfo,
	ModuleJSON,
	ModuleOptions,
	NormalizedInputOptions,
	PartialNull,
	PreserveEntrySignaturesOption,
	ResolvedIdMap,
	RollupError,
	RollupLogProps,
	RollupWarning,
	TransformModuleJSON
} from './rollup/types';
import { EMPTY_OBJECT } from './utils/blank';
import { BuildPhase } from './utils/buildPhase';
import {
	augmentCodeLocation,
	errAmbiguousExternalNamespaces,
	errCircularReexport,
	errMissingExport,
	errNamespaceConflict,
	error,
	errSyntheticNamedExportsNeedNamespaceExport
} from './utils/error';
import { getId } from './utils/getId';
import { getOrCreate } from './utils/getOrCreate';
import { getOriginalLocation } from './utils/getOriginalLocation';
import { makeLegal } from './utils/identifierHelpers';
import { basename, extname } from './utils/path';
import relativeId from './utils/relativeId';
import { RenderOptions } from './utils/renderHelpers';
import { timeEnd, timeStart } from './utils/timers';
import { markModuleAndImpureDependenciesAsExecuted } from './utils/traverseStaticDependencies';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

interface ImportDescription {
	module: Module | ExternalModule;
	name: string;
	source: string;
	start: number;
}

interface ExportDescription {
	identifier: string | null;
	localName: string;
}

interface ReexportDescription {
	localName: string;
	module: Module | ExternalModule;
	source: string;
	start: number;
}

export interface AstContext {
	addDynamicImport: (node: ImportExpression) => void;
	addExport: (
		node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration
	) => void;
	addImport: (node: ImportDeclaration) => void;
	addImportMeta: (node: MetaProperty) => void;
	code: string;
	deoptimizationTracker: PathTracker;
	error: (props: RollupError, pos: number) => never;
	fileName: string;
	getExports: () => string[];
	getModuleExecIndex: () => number;
	getModuleName: () => string;
	getNodeConstructor: (name: string) => typeof NodeBase;
	getReexports: () => string[];
	importDescriptions: { [name: string]: ImportDescription };
	includeAllExports: () => void;
	includeDynamicImport: (node: ImportExpression) => void;
	includeVariableInModule: (variable: Variable) => void;
	magicString: MagicString;
	module: Module; // not to be used for tree-shaking
	moduleContext: string;
	options: NormalizedInputOptions;
	requestTreeshakingPass: () => void;
	traceExport: (name: string) => Variable | null;
	traceVariable: (name: string) => Variable | null;
	usesTopLevelAwait: boolean;
	warn: (warning: RollupWarning, pos: number) => void;
}

export interface DynamicImport {
	argument: string | ExpressionNode;
	id: string | null;
	node: ImportExpression;
	resolution: Module | ExternalModule | string | null;
}

const MISSING_EXPORT_SHIM_DESCRIPTION: ExportDescription = {
	identifier: null,
	localName: MISSING_EXPORT_SHIM_VARIABLE
};

function getVariableForExportNameRecursive(
	target: Module | ExternalModule,
	name: string,
	importerForSideEffects: Module | undefined,
	isExportAllSearch: boolean,
	searchedNamesAndModules = new Map<string, Set<Module | ExternalModule>>(),
	skipExternalNamespaceReexports: boolean | undefined
): Variable | null {
	const searchedModules = searchedNamesAndModules.get(name);
	if (searchedModules) {
		if (searchedModules.has(target)) {
			return isExportAllSearch ? null : error(errCircularReexport(name, target.id));
		}
		searchedModules.add(target);
	} else {
		searchedNamesAndModules.set(name, new Set([target]));
	}
	return target.getVariableForExportName(name, {
		importerForSideEffects,
		isExportAllSearch,
		searchedNamesAndModules,
		skipExternalNamespaceReexports
	});
}

function getAndExtendSideEffectModules(variable: Variable, module: Module): Set<Module> {
	const sideEffectModules = getOrCreate(
		module.sideEffectDependenciesByVariable,
		variable,
		() => new Set()
	);
	let currentVariable: Variable | null = variable;
	const referencedVariables = new Set([currentVariable]);
	while (true) {
		const importingModule = currentVariable.module! as Module;
		currentVariable =
			currentVariable instanceof ExportDefaultVariable
				? currentVariable.getDirectOriginalVariable()
				: currentVariable instanceof SyntheticNamedExportVariable
				? currentVariable.syntheticNamespace
				: null;
		if (!currentVariable || referencedVariables.has(currentVariable)) {
			break;
		}
		referencedVariables.add(currentVariable);
		sideEffectModules.add(importingModule);
		const originalSideEffects =
			importingModule.sideEffectDependenciesByVariable.get(currentVariable);
		if (originalSideEffects) {
			for (const module of originalSideEffects) {
				sideEffectModules.add(module);
			}
		}
	}
	return sideEffectModules;
}

export default class Module {
	alternativeReexportModules = new Map<Variable, Module>();
	ast: Program | null = null;
	chunkFileNames = new Set<string>();
	chunkName: string | null = null;
	cycles = new Set<symbol>();
	dependencies = new Set<Module | ExternalModule>();
	dynamicDependencies = new Set<Module | ExternalModule>();
	dynamicImporters: string[] = [];
	dynamicImports: DynamicImport[] = [];
	excludeFromSourcemap: boolean;
	execIndex = Infinity;
	exportAllSources = new Set<string>();
	exports: { [name: string]: ExportDescription } = Object.create(null);
	exportsAll: { [name: string]: string } = Object.create(null);
	implicitlyLoadedAfter = new Set<Module>();
	implicitlyLoadedBefore = new Set<Module>();
	importDescriptions: { [name: string]: ImportDescription } = Object.create(null);
	importMetas: MetaProperty[] = [];
	importedFromNotTreeshaken = false;
	importers: string[] = [];
	imports = new Set<Variable>();
	includedDynamicImporters: Module[] = [];
	info: ModuleInfo;
	isExecuted = false;
	isUserDefinedEntryPoint = false;
	declare namespace: NamespaceVariable;
	needsExportShim = false;
	declare originalCode: string;
	declare originalSourcemap: ExistingDecodedSourceMap | null;
	preserveSignature: PreserveEntrySignaturesOption;
	reexportDescriptions: { [name: string]: ReexportDescription } = Object.create(null);
	declare resolvedIds: ResolvedIdMap;
	declare scope: ModuleScope;
	sideEffectDependenciesByVariable = new Map<Variable, Set<Module>>();
	declare sourcemapChain: DecodedSourceMapOrMissing[];
	sources = new Set<string>();
	declare transformFiles?: EmittedFile[];
	userChunkNames = new Set<string>();
	usesTopLevelAwait = false;

	private allExportNames: Set<string> | null = null;
	private declare astContext: AstContext;
	private readonly context: string;
	private declare customTransformCache: boolean;
	private exportAllModules: (Module | ExternalModule)[] = [];
	private exportNamesByVariable: Map<Variable, string[]> | null = null;
	private exportShimVariable: ExportShimVariable = new ExportShimVariable(this);
	private declare magicString: MagicString;
	private namespaceReexportsByName: Record<string, Variable | null> = Object.create(null);
	private relevantDependencies: Set<Module | ExternalModule> | null = null;
	private syntheticExports = new Map<string, SyntheticNamedExportVariable>();
	private syntheticNamespace: Variable | null | undefined = null;
	private transformDependencies: string[] = [];
	private transitiveReexports: string[] | null = null;

	constructor(
		private readonly graph: Graph,
		public readonly id: string,
		private readonly options: NormalizedInputOptions,
		isEntry: boolean,
		hasModuleSideEffects: boolean | 'no-treeshake',
		syntheticNamedExports: boolean | string,
		meta: CustomPluginOptions
	) {
		this.excludeFromSourcemap = /\0/.test(id);
		this.context = options.moduleContext(id);
		this.preserveSignature = this.options.preserveEntrySignatures;

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const module = this;
		this.info = {
			ast: null,
			code: null,
			get dynamicallyImportedIds() {
				const dynamicallyImportedIds: string[] = [];
				for (const { id } of module.dynamicImports) {
					if (id) {
						dynamicallyImportedIds.push(id);
					}
				}
				return dynamicallyImportedIds;
			},
			get dynamicImporters() {
				return module.dynamicImporters.sort();
			},
			hasModuleSideEffects,
			id,
			get implicitlyLoadedAfterOneOf() {
				return Array.from(module.implicitlyLoadedAfter, getId).sort();
			},
			get implicitlyLoadedBefore() {
				return Array.from(module.implicitlyLoadedBefore, getId).sort();
			},
			get importedIds() {
				return Array.from(module.sources, source => module.resolvedIds[source]?.id).filter(Boolean);
			},
			get importers() {
				return module.importers.sort();
			},
			isEntry,
			isExternal: false,
			get isIncluded() {
				if (module.graph.phase !== BuildPhase.GENERATE) {
					return null;
				}
				return module.isIncluded();
			},
			meta,
			syntheticNamedExports
		};
	}

	basename(): string {
		const base = basename(this.id);
		const ext = extname(this.id);

		return makeLegal(ext ? base.slice(0, -ext.length) : base);
	}

	bindReferences(): void {
		this.ast!.bind();
	}

	error(props: RollupError, pos: number): never {
		this.addLocationToLogProps(props, pos);
		return error(props);
	}

	getAllExportNames(): Set<string> {
		if (this.allExportNames) {
			return this.allExportNames;
		}
		const allExportNames = (this.allExportNames = new Set<string>());
		for (const name of Object.keys(this.exports)) {
			allExportNames.add(name);
		}
		for (const name of Object.keys(this.reexportDescriptions)) {
			allExportNames.add(name);
		}
		for (const module of this.exportAllModules) {
			if (module instanceof ExternalModule) {
				allExportNames.add(`*${module.id}`);
				continue;
			}

			for (const name of module.getAllExportNames()) {
				if (name !== 'default') allExportNames.add(name);
			}
		}

		return allExportNames;
	}

	getDependenciesToBeIncluded(): Set<Module | ExternalModule> {
		if (this.relevantDependencies) return this.relevantDependencies;
		const relevantDependencies = new Set<Module | ExternalModule>();
		const necessaryDependencies = new Set<Module | ExternalModule>();
		const alwaysCheckedDependencies = new Set<Module>();

		let dependencyVariables: Set<Variable> | IterableIterator<Variable> = this.imports.keys();
		if (
			this.info.isEntry ||
			this.includedDynamicImporters.length > 0 ||
			this.namespace.included ||
			this.implicitlyLoadedAfter.size > 0
		) {
			dependencyVariables = new Set(dependencyVariables);
			for (const exportName of [...this.getReexports(), ...this.getExports()]) {
				const exportedVariable = this.getVariableForExportName(exportName);
				if (exportedVariable) {
					dependencyVariables.add(exportedVariable);
				}
			}
		}
		for (let variable of dependencyVariables) {
			const sideEffectDependencies = this.sideEffectDependenciesByVariable.get(variable);
			if (sideEffectDependencies) {
				for (const module of sideEffectDependencies) {
					alwaysCheckedDependencies.add(module);
				}
			}
			if (variable instanceof SyntheticNamedExportVariable) {
				variable = variable.getBaseVariable();
			} else if (variable instanceof ExportDefaultVariable) {
				variable = variable.getOriginalVariable();
			}
			necessaryDependencies.add(variable.module!);
		}
		if (!this.options.treeshake || this.info.hasModuleSideEffects === 'no-treeshake') {
			for (const dependency of this.dependencies) {
				relevantDependencies.add(dependency);
			}
		} else {
			this.addRelevantSideEffectDependencies(
				relevantDependencies,
				necessaryDependencies,
				alwaysCheckedDependencies
			);
		}
		for (const dependency of necessaryDependencies) {
			relevantDependencies.add(dependency);
		}
		return (this.relevantDependencies = relevantDependencies);
	}

	getExportNamesByVariable(): Map<Variable, string[]> {
		if (this.exportNamesByVariable) {
			return this.exportNamesByVariable;
		}
		const exportNamesByVariable: Map<Variable, string[]> = new Map();
		for (const exportName of this.getAllExportNames()) {
			if (exportName === this.info.syntheticNamedExports) continue;
			let tracedVariable = this.getVariableForExportName(exportName);
			if (tracedVariable instanceof ExportDefaultVariable) {
				tracedVariable = tracedVariable.getOriginalVariable();
			}
			if (
				!tracedVariable ||
				!(tracedVariable.included || tracedVariable instanceof ExternalVariable)
			) {
				continue;
			}
			const existingExportNames = exportNamesByVariable.get(tracedVariable);
			if (existingExportNames) {
				existingExportNames.push(exportName);
			} else {
				exportNamesByVariable.set(tracedVariable, [exportName]);
			}
		}
		return (this.exportNamesByVariable = exportNamesByVariable);
	}

	getExports(): string[] {
		return Object.keys(this.exports);
	}

	getReexports(): string[] {
		if (this.transitiveReexports) {
			return this.transitiveReexports;
		}
		// to avoid infinite recursion when using circular `export * from X`
		this.transitiveReexports = [];

		const reexports = new Set<string>();
		for (const name in this.reexportDescriptions) {
			reexports.add(name);
		}
		for (const module of this.exportAllModules) {
			if (module instanceof ExternalModule) {
				reexports.add(`*${module.id}`);
			} else {
				for (const name of [...module.getReexports(), ...module.getExports()]) {
					if (name !== 'default') reexports.add(name);
				}
			}
		}
		return (this.transitiveReexports = [...reexports]);
	}

	getRenderedExports(): { removedExports: string[]; renderedExports: string[] } {
		// only direct exports are counted here, not reexports at all
		const renderedExports: string[] = [];
		const removedExports: string[] = [];
		for (const exportName in this.exports) {
			const variable = this.getVariableForExportName(exportName);
			(variable && variable.included ? renderedExports : removedExports).push(exportName);
		}
		return { removedExports, renderedExports };
	}

	getSyntheticNamespace(): Variable {
		if (this.syntheticNamespace === null) {
			this.syntheticNamespace = undefined;
			this.syntheticNamespace = this.getVariableForExportName(
				typeof this.info.syntheticNamedExports === 'string'
					? this.info.syntheticNamedExports
					: 'default'
			);
		}
		if (!this.syntheticNamespace) {
			return error(
				errSyntheticNamedExportsNeedNamespaceExport(this.id, this.info.syntheticNamedExports)
			);
		}
		return this.syntheticNamespace;
	}

	getVariableForExportName(
		name: string,
		{
			importerForSideEffects,
			isExportAllSearch,
			searchedNamesAndModules,
			skipExternalNamespaceReexports
		}: {
			importerForSideEffects?: Module;
			isExportAllSearch?: boolean;
			searchedNamesAndModules?: Map<string, Set<Module | ExternalModule>>;
			skipExternalNamespaceReexports?: boolean;
		} = EMPTY_OBJECT
	): Variable | null {
		if (name[0] === '*') {
			if (name.length === 1) {
				// export * from './other'
				return this.namespace;
			} else {
				// export * from 'external'
				const module = this.graph.modulesById.get(name.slice(1)) as ExternalModule;
				return module.getVariableForExportName('*');
			}
		}

		// export { foo } from './other'
		const reexportDeclaration = this.reexportDescriptions[name];
		if (reexportDeclaration) {
			const variable = getVariableForExportNameRecursive(
				reexportDeclaration.module,
				reexportDeclaration.localName,
				importerForSideEffects,
				false,
				searchedNamesAndModules,
				false
			);

			if (!variable) {
				return this.error(
					errMissingExport(reexportDeclaration.localName, this.id, reexportDeclaration.module.id),
					reexportDeclaration.start
				);
			}
			if (importerForSideEffects) {
				setAlternativeExporterIfCyclic(variable, importerForSideEffects, this);
			}
			return variable;
		}

		const exportDeclaration = this.exports[name];
		if (exportDeclaration) {
			if (exportDeclaration === MISSING_EXPORT_SHIM_DESCRIPTION) {
				return this.exportShimVariable;
			}
			const name = exportDeclaration.localName;
			const variable = this.traceVariable(name, importerForSideEffects)!;
			if (importerForSideEffects) {
				getOrCreate(
					importerForSideEffects.sideEffectDependenciesByVariable,
					variable,
					() => new Set()
				).add(this);
				setAlternativeExporterIfCyclic(variable, importerForSideEffects, this);
			}
			return variable;
		}

		if (name !== 'default') {
			const foundNamespaceReexport =
				name in this.namespaceReexportsByName
					? this.namespaceReexportsByName[name]
					: this.getVariableFromNamespaceReexports(
							name,
							importerForSideEffects,
							searchedNamesAndModules,
							skipExternalNamespaceReexports
					  );
			if (!skipExternalNamespaceReexports) {
				this.namespaceReexportsByName[name] = foundNamespaceReexport;
			}
			if (foundNamespaceReexport) {
				return foundNamespaceReexport;
			}
		}

		if (this.info.syntheticNamedExports) {
			let syntheticExport = this.syntheticExports.get(name);
			if (!syntheticExport) {
				const syntheticNamespace = this.getSyntheticNamespace();
				syntheticExport = new SyntheticNamedExportVariable(
					this.astContext,
					name,
					syntheticNamespace
				);
				this.syntheticExports.set(name, syntheticExport);
				return syntheticExport;
			}
			return syntheticExport;
		}

		// we don't want to create shims when we are just
		// probing export * modules for exports
		if (!isExportAllSearch) {
			if (this.options.shimMissingExports) {
				this.shimMissingExport(name);
				return this.exportShimVariable;
			}
		}
		return null;
	}

	hasEffects(): boolean {
		return (
			this.info.hasModuleSideEffects === 'no-treeshake' ||
			(this.ast!.included && this.ast!.hasEffects(createHasEffectsContext()))
		);
	}

	include(): void {
		const context = createInclusionContext();
		if (this.ast!.shouldBeIncluded(context)) this.ast!.include(context, false);
	}

	includeAllExports(includeNamespaceMembers: boolean): void {
		if (!this.isExecuted) {
			markModuleAndImpureDependenciesAsExecuted(this);
			this.graph.needsTreeshakingPass = true;
		}

		for (const exportName of this.getExports()) {
			if (includeNamespaceMembers || exportName !== this.info.syntheticNamedExports) {
				const variable = this.getVariableForExportName(exportName)!;
				variable.deoptimizePath(UNKNOWN_PATH);
				if (!variable.included) {
					this.includeVariable(variable);
				}
			}
		}

		for (const name of this.getReexports()) {
			const variable = this.getVariableForExportName(name);
			if (variable) {
				variable.deoptimizePath(UNKNOWN_PATH);
				if (!variable.included) {
					this.includeVariable(variable);
				}
				if (variable instanceof ExternalVariable) {
					variable.module.reexported = true;
				}
			}
		}

		if (includeNamespaceMembers) {
			this.namespace.setMergedNamespaces(this.includeAndGetAdditionalMergedNamespaces());
		}
	}

	includeAllInBundle(): void {
		this.ast!.include(createInclusionContext(), true);
		this.includeAllExports(false);
	}

	isIncluded(): boolean {
		return this.ast!.included || this.namespace.included || this.importedFromNotTreeshaken;
	}

	linkImports(): void {
		this.addModulesToImportDescriptions(this.importDescriptions);
		this.addModulesToImportDescriptions(this.reexportDescriptions);
		for (const name in this.exports) {
			if (name !== 'default' && name !== this.info.syntheticNamedExports) {
				this.exportsAll[name] = this.id;
			}
		}
		const externalExportAllModules: ExternalModule[] = [];
		for (const source of this.exportAllSources) {
			const module = this.graph.modulesById.get(this.resolvedIds[source].id)!;
			if (module instanceof ExternalModule) {
				externalExportAllModules.push(module);
				continue;
			}
			this.exportAllModules.push(module);
			for (const name in module.exportsAll) {
				if (name in this.exportsAll) {
					this.options.onwarn(errNamespaceConflict(name, this, module));
				} else {
					this.exportsAll[name] = module.exportsAll[name];
				}
			}
		}
		this.exportAllModules.push(...externalExportAllModules);
	}

	render(options: RenderOptions): MagicString {
		const magicString = this.magicString.clone();
		this.ast!.render(magicString, options);
		this.usesTopLevelAwait = this.astContext.usesTopLevelAwait;
		return magicString;
	}

	setSource({
		ast,
		code,
		customTransformCache,
		originalCode,
		originalSourcemap,
		resolvedIds,
		sourcemapChain,
		transformDependencies,
		transformFiles,
		...moduleOptions
	}: TransformModuleJSON & {
		transformFiles?: EmittedFile[] | undefined;
	}): void {
		this.info.code = code;
		this.originalCode = originalCode;
		this.originalSourcemap = originalSourcemap;
		this.sourcemapChain = sourcemapChain;
		if (transformFiles) {
			this.transformFiles = transformFiles;
		}
		this.transformDependencies = transformDependencies;
		this.customTransformCache = customTransformCache;
		this.updateOptions(moduleOptions);

		timeStart('generate ast', 3);

		if (!ast) {
			ast = this.tryParse();
		}

		timeEnd('generate ast', 3);

		this.resolvedIds = resolvedIds || Object.create(null);

		// By default, `id` is the file name. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source file name
		const fileName = this.id;

		this.magicString = new MagicString(code, {
			filename: (this.excludeFromSourcemap ? null : fileName)!, // don't include plugin helpers in sourcemap
			indentExclusionRanges: []
		});

		timeStart('analyse ast', 3);

		this.astContext = {
			addDynamicImport: this.addDynamicImport.bind(this),
			addExport: this.addExport.bind(this),
			addImport: this.addImport.bind(this),
			addImportMeta: this.addImportMeta.bind(this),
			code, // Only needed for debugging
			deoptimizationTracker: this.graph.deoptimizationTracker,
			error: this.error.bind(this),
			fileName, // Needed for warnings
			getExports: this.getExports.bind(this),
			getModuleExecIndex: () => this.execIndex,
			getModuleName: this.basename.bind(this),
			getNodeConstructor: (name: string) => nodeConstructors[name] || nodeConstructors.UnknownNode,
			getReexports: this.getReexports.bind(this),
			importDescriptions: this.importDescriptions,
			includeAllExports: () => this.includeAllExports(true),
			includeDynamicImport: this.includeDynamicImport.bind(this),
			includeVariableInModule: this.includeVariableInModule.bind(this),
			magicString: this.magicString,
			module: this,
			moduleContext: this.context,
			options: this.options,
			requestTreeshakingPass: () => (this.graph.needsTreeshakingPass = true),
			traceExport: this.getVariableForExportName.bind(this),
			traceVariable: this.traceVariable.bind(this),
			usesTopLevelAwait: false,
			warn: this.warn.bind(this)
		};

		this.scope = new ModuleScope(this.graph.scope, this.astContext);
		this.namespace = new NamespaceVariable(this.astContext);
		this.ast = new Program(ast, { context: this.astContext, type: 'Module' }, this.scope);
		this.info.ast = ast;

		timeEnd('analyse ast', 3);
	}

	toJSON(): ModuleJSON {
		return {
			ast: this.ast!.esTreeNode,
			code: this.info.code!,
			customTransformCache: this.customTransformCache,
			dependencies: Array.from(this.dependencies, getId),
			id: this.id,
			meta: this.info.meta,
			moduleSideEffects: this.info.hasModuleSideEffects,
			originalCode: this.originalCode,
			originalSourcemap: this.originalSourcemap,
			resolvedIds: this.resolvedIds,
			sourcemapChain: this.sourcemapChain,
			syntheticNamedExports: this.info.syntheticNamedExports,
			transformDependencies: this.transformDependencies,
			transformFiles: this.transformFiles
		};
	}

	traceVariable(name: string, importerForSideEffects?: Module): Variable | null {
		const localVariable = this.scope.variables.get(name);
		if (localVariable) {
			return localVariable;
		}

		if (name in this.importDescriptions) {
			const importDeclaration = this.importDescriptions[name];
			const otherModule = importDeclaration.module;

			if (otherModule instanceof Module && importDeclaration.name === '*') {
				return otherModule.namespace;
			}

			const declaration = otherModule.getVariableForExportName(importDeclaration.name, {
				importerForSideEffects: importerForSideEffects || this
			});

			if (!declaration) {
				return this.error(
					errMissingExport(importDeclaration.name, this.id, otherModule.id),
					importDeclaration.start
				);
			}

			return declaration;
		}

		return null;
	}

	tryParse(): acorn.Node {
		try {
			return this.graph.contextParse(this.info.code!);
		} catch (err: any) {
			let message = err.message.replace(/ \(\d+:\d+\)$/, '');
			if (this.id.endsWith('.json')) {
				message += ' (Note that you need @rollup/plugin-json to import JSON files)';
			} else if (!this.id.endsWith('.js')) {
				message += ' (Note that you need plugins to import files that are not JavaScript)';
			}
			return this.error(
				{
					code: 'PARSE_ERROR',
					message,
					parserError: err
				},
				err.pos
			);
		}
	}

	updateOptions({
		meta,
		moduleSideEffects,
		syntheticNamedExports
	}: Partial<PartialNull<ModuleOptions>>): void {
		if (moduleSideEffects != null) {
			this.info.hasModuleSideEffects = moduleSideEffects;
		}
		if (syntheticNamedExports != null) {
			this.info.syntheticNamedExports = syntheticNamedExports;
		}
		if (meta != null) {
			this.info.meta = { ...this.info.meta, ...meta };
		}
	}

	warn(props: RollupWarning, pos: number): void {
		this.addLocationToLogProps(props, pos);
		this.options.onwarn(props);
	}

	private addDynamicImport(node: ImportExpression) {
		let argument: ExpressionNode | string = node.source;
		if (argument instanceof TemplateLiteral) {
			if (argument.quasis.length === 1 && argument.quasis[0].value.cooked) {
				argument = argument.quasis[0].value.cooked;
			}
		} else if (argument instanceof Literal && typeof argument.value === 'string') {
			argument = argument.value;
		}
		this.dynamicImports.push({ argument, id: null, node, resolution: null });
	}

	private addExport(
		node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration
	) {
		if (node instanceof ExportDefaultDeclaration) {
			// export default foo;

			this.exports.default = {
				identifier: node.variable.getAssignedVariableName(),
				localName: 'default'
			};
		} else if (node instanceof ExportAllDeclaration) {
			const source = node.source.value;
			this.sources.add(source);
			if (node.exported) {
				// export * as name from './other'

				const name = node.exported.name;
				this.reexportDescriptions[name] = {
					localName: '*',
					module: null as never, // filled in later,
					source,
					start: node.start
				};
			} else {
				// export * from './other'

				this.exportAllSources.add(source);
			}
		} else if (node.source instanceof Literal) {
			// export { name } from './other'

			const source = node.source.value;
			this.sources.add(source);
			for (const specifier of node.specifiers) {
				const name = specifier.exported.name;
				this.reexportDescriptions[name] = {
					localName: specifier.local.name,
					module: null as never, // filled in later,
					source,
					start: specifier.start
				};
			}
		} else if (node.declaration) {
			const declaration = node.declaration;
			if (declaration instanceof VariableDeclaration) {
				// export var { foo, bar } = ...
				// export var foo = 1, bar = 2;

				for (const declarator of declaration.declarations) {
					for (const localName of extractAssignedNames(declarator.id)) {
						this.exports[localName] = { identifier: null, localName };
					}
				}
			} else {
				// export function foo () {}

				const localName = (declaration.id as Identifier).name;
				this.exports[localName] = { identifier: null, localName };
			}
		} else {
			// export { foo, bar, baz }

			for (const specifier of node.specifiers) {
				const localName = specifier.local.name;
				const exportedName = specifier.exported.name;
				this.exports[exportedName] = { identifier: null, localName };
			}
		}
	}

	private addImport(node: ImportDeclaration) {
		const source = node.source.value;
		this.sources.add(source);
		for (const specifier of node.specifiers) {
			const isDefault = specifier.type === NodeType.ImportDefaultSpecifier;
			const isNamespace = specifier.type === NodeType.ImportNamespaceSpecifier;

			const name = isDefault
				? 'default'
				: isNamespace
				? '*'
				: (specifier as ImportSpecifier).imported.name;
			this.importDescriptions[specifier.local.name] = {
				module: null as never, // filled in later
				name,
				source,
				start: specifier.start
			};
		}
	}

	private addImportMeta(node: MetaProperty) {
		this.importMetas.push(node);
	}

	private addLocationToLogProps(props: RollupLogProps, pos: number): void {
		props.id = this.id;
		props.pos = pos;
		let code = this.info.code;
		const location = locate(code!, pos, { offsetLine: 1 });
		if (location) {
			let { column, line } = location;
			try {
				({ column, line } = getOriginalLocation(this.sourcemapChain, { column, line }));
				code = this.originalCode;
			} catch (err: any) {
				this.options.onwarn({
					code: 'SOURCEMAP_ERROR',
					id: this.id,
					loc: {
						column,
						file: this.id,
						line
					},
					message: `Error when using sourcemap for reporting an error: ${err.message}`,
					pos
				});
			}
			augmentCodeLocation(props, { column, line }, code!, this.id);
		}
	}

	private addModulesToImportDescriptions(importDescription: {
		[name: string]: ImportDescription | ReexportDescription;
	}) {
		for (const specifier of Object.values(importDescription)) {
			const id = this.resolvedIds[specifier.source].id;
			specifier.module = this.graph.modulesById.get(id)!;
		}
	}

	private addRelevantSideEffectDependencies(
		relevantDependencies: Set<Module | ExternalModule>,
		necessaryDependencies: Set<Module | ExternalModule>,
		alwaysCheckedDependencies: Set<Module | ExternalModule>
	) {
		const handledDependencies = new Set<Module | ExternalModule>();

		const addSideEffectDependencies = (possibleDependencies: Set<Module | ExternalModule>) => {
			for (const dependency of possibleDependencies) {
				if (handledDependencies.has(dependency)) {
					continue;
				}
				handledDependencies.add(dependency);
				if (necessaryDependencies.has(dependency)) {
					relevantDependencies.add(dependency);
					continue;
				}
				if (!(dependency.info.hasModuleSideEffects || alwaysCheckedDependencies.has(dependency))) {
					continue;
				}
				if (dependency instanceof ExternalModule || dependency.hasEffects()) {
					relevantDependencies.add(dependency);
					continue;
				}
				addSideEffectDependencies(dependency.dependencies);
			}
		};

		addSideEffectDependencies(this.dependencies);
		addSideEffectDependencies(alwaysCheckedDependencies);
	}

	private getVariableFromNamespaceReexports(
		name: string,
		importerForSideEffects?: Module,
		searchedNamesAndModules?: Map<string, Set<Module | ExternalModule>>,
		skipExternalNamespaceReexports = false
	): Variable | null {
		let foundSyntheticDeclaration: SyntheticNamedExportVariable | null = null;
		const skipExternalNamespaceValues = [{ searchedNamesAndModules, skipExternalNamespaces: true }];
		if (!skipExternalNamespaceReexports) {
			const clonedSearchedNamesAndModules = new Map<string, Set<Module | ExternalModule>>();
			for (const [name, modules] of searchedNamesAndModules || []) {
				clonedSearchedNamesAndModules.set(name, new Set(modules));
			}
			skipExternalNamespaceValues.push({
				searchedNamesAndModules: clonedSearchedNamesAndModules,
				skipExternalNamespaces: false
			});
		}
		for (const { skipExternalNamespaces, searchedNamesAndModules } of skipExternalNamespaceValues) {
			const foundDeclarations = new Set<Variable>();
			for (const module of this.exportAllModules) {
				if (module instanceof Module || !skipExternalNamespaces) {
					const declaration = getVariableForExportNameRecursive(
						module,
						name,
						importerForSideEffects,
						true,
						searchedNamesAndModules,
						skipExternalNamespaces
					);

					if (declaration) {
						if (!(declaration instanceof SyntheticNamedExportVariable)) {
							foundDeclarations.add(declaration);
						} else if (!foundSyntheticDeclaration) {
							foundSyntheticDeclaration = declaration;
						}
					}
				}
			}
			if (foundDeclarations.size === 1) {
				return [...foundDeclarations][0];
			}
			if (foundDeclarations.size > 1) {
				if (skipExternalNamespaces) {
					return null;
				}
				const foundDeclarationList = [...(foundDeclarations as Set<ExternalVariable>)];
				const usedDeclaration = foundDeclarationList[0];
				this.options.onwarn(
					errAmbiguousExternalNamespaces(
						name,
						this.id,
						usedDeclaration.module.id,
						foundDeclarationList.map(declaration => declaration.module.id)
					)
				);
				return usedDeclaration;
			}
		}
		if (foundSyntheticDeclaration) {
			return foundSyntheticDeclaration;
		}
		return null;
	}

	private includeAndGetAdditionalMergedNamespaces(): Variable[] {
		const externalNamespaces = new Set<Variable>();
		const syntheticNamespaces = new Set<Variable>();
		for (const module of [this, ...this.exportAllModules]) {
			if (module instanceof ExternalModule) {
				const externalVariable = module.getVariableForExportName('*');
				externalVariable.include();
				this.imports.add(externalVariable);
				externalNamespaces.add(externalVariable);
			} else if (module.info.syntheticNamedExports) {
				const syntheticNamespace = module.getSyntheticNamespace();
				syntheticNamespace.include();
				this.imports.add(syntheticNamespace);
				syntheticNamespaces.add(syntheticNamespace);
			}
		}
		return [...syntheticNamespaces, ...externalNamespaces];
	}

	private includeDynamicImport(node: ImportExpression) {
		const resolution = (
			this.dynamicImports.find(dynamicImport => dynamicImport.node === node) as {
				resolution: string | Module | ExternalModule | undefined;
			}
		).resolution;
		if (resolution instanceof Module) {
			resolution.includedDynamicImporters.push(this);
			resolution.includeAllExports(true);
		}
	}

	private includeVariable(variable: Variable) {
		if (!variable.included) {
			variable.include();
			this.graph.needsTreeshakingPass = true;
			const variableModule = variable.module;
			if (variableModule && variableModule instanceof Module) {
				if (!variableModule.isExecuted) {
					markModuleAndImpureDependenciesAsExecuted(variableModule);
				}
				if (variableModule !== this) {
					const sideEffectModules = getAndExtendSideEffectModules(variable, this);
					for (const module of sideEffectModules) {
						if (!module.isExecuted) {
							markModuleAndImpureDependenciesAsExecuted(module);
						}
					}
				}
			}
		}
	}

	private includeVariableInModule(variable: Variable) {
		this.includeVariable(variable);
		const variableModule = variable.module;
		if (variableModule && variableModule !== this) {
			this.imports.add(variable);
		}
	}

	private shimMissingExport(name: string): void {
		this.options.onwarn({
			code: 'SHIMMED_EXPORT',
			exporter: relativeId(this.id),
			exportName: name,
			message: `Missing export "${name}" has been shimmed in module ${relativeId(this.id)}.`
		});
		this.exports[name] = MISSING_EXPORT_SHIM_DESCRIPTION;
	}
}

// if there is a cyclic import in the reexport chain, we should not
// import from the original module but from the cyclic module to not
// mess up execution order.
function setAlternativeExporterIfCyclic(variable: Variable, importer: Module, reexporter: Module) {
	if (variable.module instanceof Module && variable.module !== reexporter) {
		const exporterCycles = variable.module.cycles;
		if (exporterCycles.size > 0) {
			const importerCycles = reexporter.cycles;
			for (const cycleSymbol of importerCycles) {
				if (exporterCycles.has(cycleSymbol)) {
					importer.alternativeReexportModules.set(variable, reexporter);
					break;
				}
			}
		}
	}
}
