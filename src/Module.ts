import * as acorn from 'acorn';
import { locate } from 'locate-character';
import MagicString from 'magic-string';
import extractAssignedNames from 'rollup-pluginutils/src/extractAssignedNames';
import { createHasEffectsContext, createInclusionContext } from './ast/ExecutionContext';
import ExportAllDeclaration from './ast/nodes/ExportAllDeclaration';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import ExportNamedDeclaration from './ast/nodes/ExportNamedDeclaration';
import Identifier from './ast/nodes/Identifier';
import ImportDeclaration from './ast/nodes/ImportDeclaration';
import ImportExpression from './ast/nodes/ImportExpression';
import ImportSpecifier from './ast/nodes/ImportSpecifier';
import { nodeConstructors } from './ast/nodes/index';
import Literal from './ast/nodes/Literal';
import MetaProperty from './ast/nodes/MetaProperty';
import * as NodeType from './ast/nodes/NodeType';
import Program from './ast/nodes/Program';
import { ExpressionNode, NodeBase } from './ast/nodes/shared/Node';
import TemplateLiteral from './ast/nodes/TemplateLiteral';
import VariableDeclaration from './ast/nodes/VariableDeclaration';
import ModuleScope from './ast/scopes/ModuleScope';
import { PathTracker, UNKNOWN_PATH } from './ast/utils/PathTracker';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import ExportShimVariable from './ast/variables/ExportShimVariable';
import ExternalVariable from './ast/variables/ExternalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import SyntheticNamedExportVariable from './ast/variables/SyntheticNamedExportVariable';
import Variable from './ast/variables/Variable';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import {
	DecodedSourceMapOrMissing,
	EmittedFile,
	ExistingDecodedSourceMap,
	ModuleJSON,
	NormalizedInputOptions,
	PreserveEntrySignaturesOption,
	ResolvedIdMap,
	RollupError,
	RollupLogProps,
	RollupWarning,
	TransformModuleJSON
} from './rollup/types';
import { augmentCodeLocation, errNamespaceConflict, error, Errors } from './utils/error';
import { getId } from './utils/getId';
import { getOriginalLocation } from './utils/getOriginalLocation';
import { makeLegal } from './utils/identifierHelpers';
import { basename, extname } from './utils/path';
import { markPureCallExpressions } from './utils/pureComments';
import relativeId from './utils/relativeId';
import { RenderOptions } from './utils/renderHelpers';
import { SOURCEMAPPING_URL_RE } from './utils/sourceMappingURL';
import { timeEnd, timeStart } from './utils/timers';
import { markModuleAndImpureDependenciesAsExecuted } from './utils/traverseStaticDependencies';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

export interface CommentDescription {
	block: boolean;
	end: number;
	start: number;
	text: string;
}

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
	getReexports: () => string[];
	importDescriptions: { [name: string]: ImportDescription };
	includeAndGetAdditionalMergedNamespaces: () => Variable[];
	includeDynamicImport: (node: ImportExpression) => void;
	includeVariable: (variable: Variable) => void;
	magicString: MagicString;
	module: Module; // not to be used for tree-shaking
	moduleContext: string;
	nodeConstructors: { [name: string]: typeof NodeBase };
	options: NormalizedInputOptions;
	traceExport: (name: string) => Variable;
	traceVariable: (name: string) => Variable | null;
	usesTopLevelAwait: boolean;
	warn: (warning: RollupWarning, pos: number) => void;
}

function tryParse(module: Module, Parser: typeof acorn.Parser, acornOptions: acorn.Options) {
	try {
		return Parser.parse(module.code, {
			...acornOptions,
			onComment: (block: boolean, text: string, start: number, end: number) =>
				module.comments.push({ block, text, start, end })
		});
	} catch (err) {
		let message = err.message.replace(/ \(\d+:\d+\)$/, '');
		if (module.id.endsWith('.json')) {
			message += ' (Note that you need @rollup/plugin-json to import JSON files)';
		} else if (!module.id.endsWith('.js')) {
			message += ' (Note that you need plugins to import files that are not JavaScript)';
		}
		return module.error(
			{
				code: 'PARSE_ERROR',
				message,
				parserError: err
			},
			err.pos
		);
	}
}

function handleMissingExport(
	exportName: string,
	importingModule: Module,
	importedModule: string,
	importerStart?: number
): never {
	return importingModule.error(
		{
			code: 'MISSING_EXPORT',
			message: `'${exportName}' is not exported by ${relativeId(
				importedModule
			)}, imported by ${relativeId(importingModule.id)}`,
			url: `https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module`
		},
		importerStart!
	);
}

const MISSING_EXPORT_SHIM_DESCRIPTION: ExportDescription = {
	identifier: null,
	localName: MISSING_EXPORT_SHIM_VARIABLE
};

function getVariableForExportNameRecursive(
	target: Module | ExternalModule,
	name: string,
	isExportAllSearch: boolean,
	searchedNamesAndModules = new Map<string, Set<Module | ExternalModule>>()
): Variable | null {
	const searchedModules = searchedNamesAndModules.get(name);
	if (searchedModules) {
		if (searchedModules.has(target)) {
			return null;
		}
		searchedModules.add(target);
	} else {
		searchedNamesAndModules.set(name, new Set([target]));
	}
	return target.getVariableForExportName(name, isExportAllSearch, searchedNamesAndModules);
}

export default class Module {
	chunkFileNames = new Set<string>();
	chunkName: string | null = null;
	code!: string;
	comments: CommentDescription[] = [];
	dependencies = new Set<Module | ExternalModule>();
	dynamicDependencies = new Set<Module | ExternalModule>();
	dynamicImporters: string[] = [];
	dynamicImports: {
		argument: string | ExpressionNode;
		node: ImportExpression;
		resolution: Module | ExternalModule | string | null;
	}[] = [];
	excludeFromSourcemap: boolean;
	execIndex = Infinity;
	exportAllSources = new Set<string>();
	exports: { [name: string]: ExportDescription } = Object.create(null);
	exportsAll: { [name: string]: string } = Object.create(null);
	implicitlyLoadedAfter = new Set<Module>();
	implicitlyLoadedBefore = new Set<Module>();
	importDescriptions: { [name: string]: ImportDescription } = Object.create(null);
	importers: string[] = [];
	importMetas: MetaProperty[] = [];
	imports = new Set<Variable>();
	includedDynamicImporters: Module[] = [];
	isExecuted = false;
	isUserDefinedEntryPoint = false;
	namespace!: NamespaceVariable;
	originalCode!: string;
	originalSourcemap!: ExistingDecodedSourceMap | null;
	preserveSignature: PreserveEntrySignaturesOption = this.options.preserveEntrySignatures;
	reexportDescriptions: { [name: string]: ReexportDescription } = Object.create(null);
	resolvedIds!: ResolvedIdMap;
	scope!: ModuleScope;
	sourcemapChain!: DecodedSourceMapOrMissing[];
	sources = new Set<string>();
	transformFiles?: EmittedFile[];
	userChunkNames = new Set<string>();
	usesTopLevelAwait = false;

	private allExportNames: Set<string> | null = null;
	private alwaysRemovedCode!: [number, number][];
	private ast!: Program;
	private astContext!: AstContext;
	private context: string;
	private customTransformCache!: boolean;
	private defaultExport: Variable | null | undefined = null;
	private esTreeAst!: acorn.Node;
	private exportAllModules: (Module | ExternalModule)[] = [];
	private exportNamesByVariable: Map<Variable, string[]> | null = null;
	private exportShimVariable: ExportShimVariable = new ExportShimVariable(this);
	private magicString!: MagicString;
	private relevantDependencies: Set<Module | ExternalModule> | null = null;
	private syntheticExports = new Map<string, SyntheticNamedExportVariable>();
	private transformDependencies: string[] = [];
	private transitiveReexports: string[] | null = null;

	constructor(
		private readonly graph: Graph,
		public readonly id: string,
		private readonly options: NormalizedInputOptions,
		public moduleSideEffects: boolean,
		public syntheticNamedExports: boolean,
		public isEntryPoint: boolean
	) {
		this.excludeFromSourcemap = /\0/.test(id);
		this.context = options.moduleContext(id);
	}

	basename() {
		const base = basename(this.id);
		const ext = extname(this.id);

		return makeLegal(ext ? base.slice(0, -ext.length) : base);
	}

	bindReferences() {
		this.ast.bind();
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

	getDefaultExport() {
		if (this.defaultExport === null) {
			this.defaultExport = undefined;
			this.defaultExport = this.getVariableForExportName('default');
		}
		if (!this.defaultExport) {
			return error({
				code: Errors.SYNTHETIC_NAMED_EXPORTS_NEED_DEFAULT,
				id: this.id,
				message: `Module "${relativeId(
					this.id
				)}" that is marked to have "syntheticNamedExports" needs a default export.`
			});
		}
		return this.defaultExport;
	}

	getDependenciesToBeIncluded(): Set<Module | ExternalModule> {
		if (this.relevantDependencies) return this.relevantDependencies;
		const relevantDependencies = new Set<Module | ExternalModule>();
		const additionalSideEffectModules = new Set<Module>();
		const possibleDependencies = new Set(this.dependencies);
		let dependencyVariables = this.imports;
		if (this.isEntryPoint || this.includedDynamicImporters.length > 0 || this.namespace.included) {
			dependencyVariables = new Set(dependencyVariables);
			for (const exportName of [...this.getReexports(), ...this.getExports()]) {
				dependencyVariables.add(this.getVariableForExportName(exportName));
			}
		}
		for (let variable of dependencyVariables) {
			if (variable instanceof SyntheticNamedExportVariable) {
				variable = variable.getBaseVariable();
			} else if (variable instanceof ExportDefaultVariable) {
				const { modules, original } = variable.getOriginalVariableAndDeclarationModules();
				variable = original;
				for (const module of modules) {
					additionalSideEffectModules.add(module);
					possibleDependencies.add(module);
				}
			}
			relevantDependencies.add(variable.module!);
		}
		if (this.options.treeshake) {
			for (const dependency of possibleDependencies) {
				if (
					!(
						dependency.moduleSideEffects || additionalSideEffectModules.has(dependency as Module)
					) ||
					relevantDependencies.has(dependency)
				) {
					continue;
				}
				if (dependency instanceof ExternalModule || dependency.hasEffects()) {
					relevantDependencies.add(dependency);
				} else {
					for (const transitiveDependency of dependency.dependencies) {
						possibleDependencies.add(transitiveDependency);
					}
				}
			}
		} else {
			for (const dependency of this.dependencies) {
				relevantDependencies.add(dependency);
			}
		}
		return (this.relevantDependencies = relevantDependencies);
	}

	getExportNamesByVariable(): Map<Variable, string[]> {
		if (this.exportNamesByVariable) {
			return this.exportNamesByVariable;
		}
		const exportNamesByVariable: Map<Variable, string[]> = new Map();
		for (const exportName of this.getAllExportNames()) {
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

	getExports() {
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

	getRenderedExports() {
		// only direct exports are counted here, not reexports at all
		const renderedExports: string[] = [];
		const removedExports: string[] = [];
		for (const exportName in this.exports) {
			const variable = this.getVariableForExportName(exportName);
			(variable && variable.included ? renderedExports : removedExports).push(exportName);
		}
		return { renderedExports, removedExports };
	}

	getVariableForExportName(
		name: string,
		isExportAllSearch?: boolean,
		searchedNamesAndModules?: Map<string, Set<Module | ExternalModule>>
	): Variable {
		if (name[0] === '*') {
			if (name.length === 1) {
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
			const declaration = getVariableForExportNameRecursive(
				reexportDeclaration.module,
				reexportDeclaration.localName,
				false,
				searchedNamesAndModules
			);

			if (!declaration) {
				return handleMissingExport(
					reexportDeclaration.localName,
					this,
					reexportDeclaration.module.id,
					reexportDeclaration.start
				);
			}

			return declaration;
		}

		const exportDeclaration = this.exports[name];
		if (exportDeclaration) {
			if (exportDeclaration === MISSING_EXPORT_SHIM_DESCRIPTION) {
				return this.exportShimVariable;
			}
			const name = exportDeclaration.localName;
			return this.traceVariable(name)!;
		}

		if (name !== 'default') {
			for (const module of this.exportAllModules) {
				const declaration = getVariableForExportNameRecursive(
					module,
					name,
					true,
					searchedNamesAndModules
				);

				if (declaration) return declaration;
			}
		}

		// we don't want to create shims when we are just
		// probing export * modules for exports
		if (!isExportAllSearch) {
			if (this.syntheticNamedExports) {
				let syntheticExport = this.syntheticExports.get(name);
				if (!syntheticExport) {
					const defaultExport = this.getDefaultExport();
					syntheticExport = new SyntheticNamedExportVariable(this.astContext, name, defaultExport);
					this.syntheticExports.set(name, syntheticExport);
					return syntheticExport;
				}
				return syntheticExport;
			}

			if (this.options.shimMissingExports) {
				this.shimMissingExport(name);
				return this.exportShimVariable;
			}
		}
		return null as any;
	}

	hasEffects() {
		return this.ast.included && this.ast.hasEffects(createHasEffectsContext());
	}

	include(): void {
		const context = createInclusionContext();
		if (this.ast.shouldBeIncluded(context)) this.ast.include(context, false);
	}

	includeAllExports() {
		if (!this.isExecuted) {
			this.graph.needsTreeshakingPass = true;
			markModuleAndImpureDependenciesAsExecuted(this);
		}

		for (const exportName of this.getExports()) {
			const variable = this.getVariableForExportName(exportName);
			variable.deoptimizePath(UNKNOWN_PATH);
			if (!variable.included) {
				variable.include();
				this.graph.needsTreeshakingPass = true;
			}
		}

		for (const name of this.getReexports()) {
			const variable = this.getVariableForExportName(name);
			variable.deoptimizePath(UNKNOWN_PATH);
			if (!variable.included) {
				variable.include();
				this.graph.needsTreeshakingPass = true;
			}
			if (variable instanceof ExternalVariable) {
				variable.module.reexported = true;
			}
		}
	}

	includeAllInBundle() {
		this.ast.include(createInclusionContext(), true);
	}

	isIncluded() {
		return this.ast.included || this.namespace.included;
	}

	linkImports() {
		this.addModulesToImportDescriptions(this.importDescriptions);
		this.addModulesToImportDescriptions(this.reexportDescriptions);
		for (const name in this.exports) {
			if (name !== 'default') {
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
		this.ast.render(magicString, options);
		this.usesTopLevelAwait = this.astContext.usesTopLevelAwait;
		return magicString;
	}

	setSource({
		alwaysRemovedCode,
		ast,
		code,
		customTransformCache,
		moduleSideEffects,
		originalCode,
		originalSourcemap,
		resolvedIds,
		sourcemapChain,
		syntheticNamedExports,
		transformDependencies,
		transformFiles
	}: TransformModuleJSON & {
		alwaysRemovedCode?: [number, number][];
		transformFiles?: EmittedFile[] | undefined;
	}) {
		this.code = code;
		this.originalCode = originalCode;
		this.originalSourcemap = originalSourcemap;
		this.sourcemapChain = sourcemapChain;
		if (transformFiles) {
			this.transformFiles = transformFiles;
		}
		this.transformDependencies = transformDependencies;
		this.customTransformCache = customTransformCache;
		if (typeof moduleSideEffects === 'boolean') {
			this.moduleSideEffects = moduleSideEffects;
		}
		if (typeof syntheticNamedExports === 'boolean') {
			this.syntheticNamedExports = syntheticNamedExports;
		}

		timeStart('generate ast', 3);

		this.alwaysRemovedCode = alwaysRemovedCode || [];
		if (ast) {
			this.esTreeAst = ast;
		} else {
			this.esTreeAst = tryParse(this, this.graph.acornParser, this.options.acorn);
			for (const comment of this.comments) {
				if (!comment.block && SOURCEMAPPING_URL_RE.test(comment.text)) {
					this.alwaysRemovedCode.push([comment.start, comment.end]);
				}
			}
			markPureCallExpressions(this.comments, this.esTreeAst);
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
		for (const [start, end] of this.alwaysRemovedCode) {
			this.magicString.remove(start, end);
		}

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
			getReexports: this.getReexports.bind(this),
			importDescriptions: this.importDescriptions,
			includeAndGetAdditionalMergedNamespaces: this.includeAndGetAdditionalMergedNamespaces.bind(
				this
			),
			includeDynamicImport: this.includeDynamicImport.bind(this),
			includeVariable: this.includeVariable.bind(this),
			magicString: this.magicString,
			module: this,
			moduleContext: this.context,
			nodeConstructors,
			options: this.options,
			traceExport: this.getVariableForExportName.bind(this),
			traceVariable: this.traceVariable.bind(this),
			usesTopLevelAwait: false,
			warn: this.warn.bind(this)
		};

		this.scope = new ModuleScope(this.graph.scope, this.astContext);
		this.namespace = new NamespaceVariable(this.astContext, this.syntheticNamedExports);
		this.ast = new Program(
			this.esTreeAst,
			{ type: 'Module', context: this.astContext },
			this.scope
		);

		timeEnd('analyse ast', 3);
	}

	toJSON(): ModuleJSON {
		return {
			alwaysRemovedCode: this.alwaysRemovedCode,
			ast: this.esTreeAst,
			code: this.code,
			customTransformCache: this.customTransformCache,
			dependencies: Array.from(this.dependencies, getId),
			id: this.id,
			moduleSideEffects: this.moduleSideEffects,
			originalCode: this.originalCode,
			originalSourcemap: this.originalSourcemap,
			resolvedIds: this.resolvedIds,
			sourcemapChain: this.sourcemapChain,
			syntheticNamedExports: this.syntheticNamedExports,
			transformDependencies: this.transformDependencies,
			transformFiles: this.transformFiles
		};
	}

	traceVariable(name: string): Variable | null {
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

			const declaration = otherModule.getVariableForExportName(importDeclaration.name);

			if (!declaration) {
				return handleMissingExport(
					importDeclaration.name,
					this,
					otherModule.id,
					importDeclaration.start
				);
			}

			return declaration;
		}

		return null;
	}

	warn(props: RollupWarning, pos: number) {
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
		this.dynamicImports.push({ node, resolution: null, argument });
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
					module: null as any, // filled in later,
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
					module: null as any, // filled in later,
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
				module: null as any, // filled in later
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
		let code = this.code;
		let { column, line } = locate(code, pos, { offsetLine: 1 });
		try {
			({ column, line } = getOriginalLocation(this.sourcemapChain, { column, line }));
			code = this.originalCode;
		} catch (e) {
			this.options.onwarn({
				code: 'SOURCEMAP_ERROR',
				id: this.id,
				loc: {
					column,
					file: this.id,
					line
				},
				message: `Error when using sourcemap for reporting an error: ${e.message}`,
				pos
			});
		}
		augmentCodeLocation(props, { column, line }, code, this.id);
	}

	private addModulesToImportDescriptions(importDescription: {
		[name: string]: ImportDescription | ReexportDescription;
	}) {
		for (const name of Object.keys(importDescription)) {
			const specifier = importDescription[name];
			const id = this.resolvedIds[specifier.source].id;
			specifier.module = this.graph.modulesById.get(id)!;
		}
	}

	private includeAndGetAdditionalMergedNamespaces(): Variable[] {
		const mergedNamespaces: Variable[] = [];
		for (const module of this.exportAllModules) {
			if (module instanceof ExternalModule) {
				const externalVariable = module.getVariableForExportName('*');
				externalVariable.include();
				this.imports.add(externalVariable);
				mergedNamespaces.push(externalVariable);
			} else if (module.syntheticNamedExports) {
				const syntheticNamespace = module.getDefaultExport();
				syntheticNamespace.include();
				this.imports.add(syntheticNamespace);
				mergedNamespaces.push(syntheticNamespace);
			}
		}
		return mergedNamespaces;
	}

	private includeDynamicImport(node: ImportExpression) {
		const resolution = (this.dynamicImports.find(dynamicImport => dynamicImport.node === node) as {
			resolution: string | Module | ExternalModule | undefined;
		}).resolution;
		if (resolution instanceof Module) {
			resolution.includedDynamicImporters.push(this);
			resolution.includeAllExports();
		}
	}

	private includeVariable(variable: Variable) {
		const variableModule = variable.module;
		if (!variable.included) {
			variable.include();
			this.graph.needsTreeshakingPass = true;
		}
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
