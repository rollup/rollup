import { IParse, Options as AcornOptions } from 'acorn';
import * as ESTree from 'estree';
import { locate } from 'locate-character';
import MagicString from 'magic-string';
import ExportAllDeclaration from './ast/nodes/ExportAllDeclaration';
import ExportDefaultDeclaration, {
	isExportDefaultDeclaration
} from './ast/nodes/ExportDefaultDeclaration';
import ExportNamedDeclaration from './ast/nodes/ExportNamedDeclaration';
import FunctionDeclaration from './ast/nodes/FunctionDeclaration';
import Identifier from './ast/nodes/Identifier';
import Import from './ast/nodes/Import';
import ImportDeclaration from './ast/nodes/ImportDeclaration';
import ImportSpecifier from './ast/nodes/ImportSpecifier';
import { nodeConstructors } from './ast/nodes/index';
import { isLiteral } from './ast/nodes/Literal';
import MetaProperty from './ast/nodes/MetaProperty';
import * as NodeType from './ast/nodes/NodeType';
import Program from './ast/nodes/Program';
import { GenericEsTreeNode, Node, NodeBase } from './ast/nodes/shared/Node';
import { isTemplateLiteral } from './ast/nodes/TemplateLiteral';
import ModuleScope from './ast/scopes/ModuleScope';
import { EntityPathTracker } from './ast/utils/EntityPathTracker';
import extractNames from './ast/utils/extractNames';
import { UNKNOWN_PATH } from './ast/values';
import ExternalVariable from './ast/variables/ExternalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import Variable from './ast/variables/Variable';
import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import { Asset, IdMap, ModuleJSON, RawSourceMap, RollupError, RollupWarning } from './rollup/types';
import error from './utils/error';
import getCodeFrame from './utils/getCodeFrame';
import { getOriginalLocation } from './utils/getOriginalLocation';
import { makeLegal } from './utils/identifierHelpers';
import { basename, extname } from './utils/path';
import relativeId from './utils/relativeId';
import { RenderOptions } from './utils/renderHelpers';
import { SOURCEMAPPING_URL_RE } from './utils/sourceMappingURL';
import { timeEnd, timeStart } from './utils/timers';

export interface CommentDescription {
	block: boolean;
	text: string;
	start: number;
	end: number;
}

export interface ImportDescription {
	source: string;
	start: number;
	name: string;
	module: Module | ExternalModule | null;
}

export interface ExportDescription {
	localName: string;
	identifier?: string;
	node?: Node;
}

export interface ReexportDescription {
	localName: string;
	start: number;
	source: string;
	module: Module;
}

export interface AstContext {
	addDynamicImport: (node: Import) => void;
	addExport: (
		node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration
	) => void;
	addImport: (node: ImportDeclaration) => void;
	addImportMeta: (node: MetaProperty) => void;
	code: string;
	error: (props: RollupError, pos: number) => void;
	fileName: string;
	getAssetFileName: (assetId: string) => string;
	getExports: () => string[];
	getModuleExecIndex: () => number;
	getModuleName: () => string;
	getReexports: () => string[];
	imports: { [name: string]: ImportDescription };
	isCrossChunkImport: (importDescription: ImportDescription) => boolean;
	includeNamespace: () => void;
	magicString: MagicString;
	moduleContext: string;
	nodeConstructors: { [name: string]: typeof NodeBase };
	propertyReadSideEffects: boolean;
	deoptimizationTracker: EntityPathTracker;
	requestTreeshakingPass: () => void;
	traceExport: (name: string) => Variable;
	traceVariable: (name: string) => Variable;
	treeshake: boolean;
	usesTopLevelAwait: boolean;
	varOrConst: string;
	warn: (warning: RollupWarning, pos: number) => void;
}

export const defaultAcornOptions: AcornOptions = {
	// TODO TypeScript waiting for acorn types to be updated
	ecmaVersion: <any>2018,
	sourceType: 'module',
	preserveParens: false
};

function tryParse(module: Module, parse: IParse, acornOptions: AcornOptions) {
	try {
		return parse(module.code, {
			...defaultAcornOptions,
			...acornOptions,
			onComment: (block: boolean, text: string, start: number, end: number) =>
				module.comments.push({ block, text, start, end })
		});
	} catch (err) {
		module.error(
			{
				code: 'PARSE_ERROR',
				message: err.message.replace(/ \(\d+:\d+\)$/, '')
			},
			err.pos
		);
	}
}

function includeFully(node: Node) {
	node.included = true;
	if (node.variable && !node.variable.included) {
		node.variable.include();
	}
	for (const key of node.keys) {
		const value = (<GenericEsTreeNode>node)[key];
		if (value === null) continue;
		if (Array.isArray(value)) {
			for (const child of value) {
				if (child !== null) includeFully(child);
			}
		} else {
			includeFully(value);
		}
	}
}

function handleMissingExport(
	exportName: string,
	importingModule: Module,
	importedModule: string,
	importerStart?: number
) {
	importingModule.error(
		{
			code: 'MISSING_EXPORT',
			message: `'${exportName}' is not exported by ${relativeId(importedModule)}`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
		},
		importerStart
	);
}

export default class Module {
	type: 'Module';
	private graph: Graph;
	code: string;
	comments: CommentDescription[];
	dependencies: (Module | ExternalModule)[];
	excludeFromSourcemap: boolean;
	exports: { [name: string]: ExportDescription };
	exportsAll: { [name: string]: string };
	exportAllSources: string[];
	id: string;
	imports: { [name: string]: ImportDescription };
	isExternal: false;
	originalCode: string;
	originalSourcemap: RawSourceMap | void;
	reexports: { [name: string]: ReexportDescription };
	resolvedIds: IdMap;
	scope: ModuleScope;
	sourcemapChain: RawSourceMap[];
	sources: string[];
	dynamicImports: Import[];
	importMetas: MetaProperty[];
	dynamicImportResolutions: {
		alias: string;
		resolution: Module | ExternalModule | string | void;
	}[];
	transformAssets: Asset[];
	customTransformCache: boolean;

	execIndex: number;
	isEntryPoint: boolean;
	chunkAlias: string;
	entryPointsHash: Uint8Array;
	chunk: Chunk;
	exportAllModules: (Module | ExternalModule)[];
	usesTopLevelAwait: boolean = false;

	private ast: Program;
	private astContext: AstContext;
	private context: string;
	private namespaceVariable: NamespaceVariable = undefined;
	private esTreeAst: ESTree.Program;
	private magicString: MagicString;
	private needsTreeshakingPass: boolean = false;
	private transformDependencies: string[];

	constructor(graph: Graph, id: string) {
		this.id = id;
		this.chunkAlias = undefined;
		this.graph = graph;
		this.comments = [];

		this.dynamicImports = [];
		this.importMetas = [];
		this.dynamicImportResolutions = [];
		this.isEntryPoint = false;
		this.execIndex = null;
		this.entryPointsHash = new Uint8Array(10);

		this.excludeFromSourcemap = /\0/.test(id);
		this.context = graph.getModuleContext(id);

		// all dependencies
		this.sources = [];
		this.dependencies = [];

		// imports and exports, indexed by local name
		this.imports = Object.create(null);
		this.exports = Object.create(null);
		this.exportsAll = Object.create(null);
		this.reexports = Object.create(null);

		this.exportAllSources = [];
		this.exportAllModules = null;
	}

	setSource({
		code,
		originalCode,
		originalSourcemap,
		ast,
		sourcemapChain,
		resolvedIds,
		transformDependencies,
		customTransformCache
	}: ModuleJSON) {
		this.code = code;
		this.originalCode = originalCode;
		this.originalSourcemap = originalSourcemap;
		this.sourcemapChain = sourcemapChain;
		this.transformDependencies = transformDependencies;
		this.customTransformCache = customTransformCache;

		timeStart('generate ast', 3);

		this.esTreeAst = ast || tryParse(this, this.graph.acornParse, this.graph.acornOptions);

		timeEnd('generate ast', 3);

		this.resolvedIds = resolvedIds || Object.create(null);

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		const fileName = this.id;

		this.magicString = new MagicString(code, {
			filename: this.excludeFromSourcemap ? null : fileName, // don't include plugin helpers in sourcemap
			indentExclusionRanges: []
		});
		this.removeExistingSourceMap();

		timeStart('analyse ast', 3);

		this.astContext = {
			addDynamicImport: this.addDynamicImport.bind(this),
			addExport: this.addExport.bind(this),
			addImport: this.addImport.bind(this),
			addImportMeta: this.addImportMeta.bind(this),
			code, // Only needed for debugging
			error: this.error.bind(this),
			fileName, // Needed for warnings
			getAssetFileName: this.graph.pluginDriver.getAssetFileName,
			getExports: this.getExports.bind(this),
			getReexports: this.getReexports.bind(this),
			getModuleExecIndex: () => this.execIndex,
			getModuleName: this.basename.bind(this),
			imports: this.imports,
			includeNamespace: this.includeNamespace.bind(this),
			isCrossChunkImport: importDescription => importDescription.module.chunk !== this.chunk,
			magicString: this.magicString,
			moduleContext: this.context,
			nodeConstructors,
			propertyReadSideEffects:
				!this.graph.treeshake || this.graph.treeshakingOptions.propertyReadSideEffects,
			deoptimizationTracker: this.graph.deoptimizationTracker,
			requestTreeshakingPass: () => (this.needsTreeshakingPass = true),
			traceExport: this.traceExport.bind(this),
			traceVariable: this.traceVariable.bind(this),
			treeshake: this.graph.treeshake,
			usesTopLevelAwait: false,
			varOrConst: this.graph.varOrConst,
			warn: this.warn.bind(this)
		};

		this.scope = new ModuleScope(this.graph.scope, this.astContext);
		this.ast = new Program(
			this.esTreeAst,
			{ type: 'Module', context: this.astContext },
			this.scope
		);

		timeEnd('analyse ast', 3);
	}

	private removeExistingSourceMap() {
		for (const comment of this.comments) {
			if (!comment.block && SOURCEMAPPING_URL_RE.test(comment.text)) {
				this.magicString.remove(comment.start, comment.end);
			}
		}
	}

	private addExport(
		node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration
	) {
		const source = (<ExportAllDeclaration>node).source && (<ExportAllDeclaration>node).source.value;

		// export { name } from './other'
		if (source) {
			if (this.sources.indexOf(source) === -1) this.sources.push(source);

			if (node.type === NodeType.ExportAllDeclaration) {
				// Store `export * from '...'` statements in an array of delegates.
				// When an unknown import is encountered, we see if one of them can satisfy it.
				this.exportAllSources.push(source);
			} else {
				for (const specifier of (<ExportNamedDeclaration>node).specifiers) {
					const name = specifier.exported.name;

					if (this.exports[name] || this.reexports[name]) {
						this.error(
							{
								code: 'DUPLICATE_EXPORT',
								message: `A module cannot have multiple exports with the same name ('${name}')`
							},
							specifier.start
						);
					}

					this.reexports[name] = {
						start: specifier.start,
						source,
						localName: specifier.local.name,
						module: null // filled in later
					};
				}
			}
		} else if (isExportDefaultDeclaration(node)) {
			// export default function foo () {}
			// export default foo;
			// export default 42;
			const identifier =
				((<FunctionDeclaration>node.declaration).id &&
					(<FunctionDeclaration>node.declaration).id.name) ||
				(<Identifier>node.declaration).name;
			if (this.exports.default) {
				this.error(
					{
						code: 'DUPLICATE_EXPORT',
						message: `A module can only have one default export`
					},
					node.start
				);
			}

			this.exports.default = {
				localName: 'default',
				identifier,
				node
			};
		} else if ((<ExportNamedDeclaration>node).declaration) {
			// export var { foo, bar } = ...
			// export var foo = 42;
			// export var a = 1, b = 2, c = 3;
			// export function foo () {}
			const declaration = (<ExportNamedDeclaration>node).declaration;

			if (declaration.type === NodeType.VariableDeclaration) {
				for (const decl of declaration.declarations) {
					for (const localName of extractNames(decl.id)) {
						this.exports[localName] = { localName, node };
					}
				}
			} else {
				// export function foo () {}
				const localName = declaration.id.name;
				this.exports[localName] = { localName, node };
			}
		} else {
			// export { foo, bar, baz }
			for (const specifier of (<ExportNamedDeclaration>node).specifiers) {
				const localName = specifier.local.name;
				const exportedName = specifier.exported.name;

				if (this.exports[exportedName] || this.reexports[exportedName]) {
					this.error(
						{
							code: 'DUPLICATE_EXPORT',
							message: `A module cannot have multiple exports with the same name ('${exportedName}')`
						},
						specifier.start
					);
				}

				this.exports[exportedName] = { localName, node };
			}
		}
	}

	private addImport(node: ImportDeclaration) {
		const source = node.source.value;

		if (this.sources.indexOf(source) === -1) this.sources.push(source);

		for (const specifier of node.specifiers) {
			const localName = specifier.local.name;

			if (this.imports[localName]) {
				this.error(
					{
						code: 'DUPLICATE_IMPORT',
						message: `Duplicated import '${localName}'`
					},
					specifier.start
				);
			}

			const isDefault = specifier.type === NodeType.ImportDefaultSpecifier;
			const isNamespace = specifier.type === NodeType.ImportNamespaceSpecifier;

			const name = isDefault
				? 'default'
				: isNamespace
					? '*'
					: (<ImportSpecifier>specifier).imported.name;
			this.imports[localName] = { source, start: specifier.start, name, module: null };
		}
	}

	private addDynamicImport(node: Import) {
		this.dynamicImports.push(node);
	}

	private addImportMeta(node: MetaProperty) {
		this.importMetas.push(node);
	}

	basename() {
		const base = basename(this.id);
		const ext = extname(this.id);

		return makeLegal(ext ? base.slice(0, -ext.length) : base);
	}

	markPublicExports() {
		for (const exportName of this.getExports()) {
			const variable = this.traceExport(exportName);

			variable.exportName = exportName;
			variable.deoptimizePath(UNKNOWN_PATH);
			variable.include();

			if (variable.isNamespace) {
				(<NamespaceVariable>variable).needsNamespaceBlock = true;
			}
		}

		for (const name of this.getReexports()) {
			const variable = this.traceExport(name);

			variable.exportName = name;

			if (variable.isExternal) {
				variable.reexported = (<ExternalVariable>variable).module.reexported = true;
			} else {
				variable.include();
				variable.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	linkDependencies() {
		for (const source of this.sources) {
			const id = this.resolvedIds[source];

			if (id) {
				const module = this.graph.moduleById.get(id);
				this.dependencies.push(<Module>module);
			}
		}

		const resolveSpecifiers = (specifiers: {
			[name: string]: ImportDescription | ReexportDescription;
		}) => {
			for (const name of Object.keys(specifiers)) {
				const specifier = specifiers[name];

				const id = this.resolvedIds[specifier.source];
				specifier.module = this.graph.moduleById.get(id);
			}
		};

		resolveSpecifiers(this.imports);
		resolveSpecifiers(this.reexports);

		this.exportAllModules = this.exportAllSources.map(source => {
			const id = this.resolvedIds[source];
			return this.graph.moduleById.get(id);
		});
	}

	bindReferences() {
		this.ast.bind();
	}

	getDynamicImportExpressions(): (string | Node)[] {
		return this.dynamicImports.map(node => {
			const importArgument = node.parent.arguments[0];
			if (isTemplateLiteral(importArgument)) {
				if (importArgument.expressions.length === 0 && importArgument.quasis.length === 1) {
					return importArgument.quasis[0].value.cooked;
				}
			} else if (isLiteral(importArgument)) {
				if (typeof importArgument.value === 'string') {
					return importArgument.value;
				}
			} else {
				return importArgument;
			}
		});
	}

	error(props: RollupError, pos: number) {
		if (pos !== undefined) {
			props.pos = pos;

			let location = locate(this.code, pos, { offsetLine: 1 });
			try {
				location = getOriginalLocation(this.sourcemapChain, location);
			} catch (e) {
				this.warn(
					{
						loc: {
							file: this.id,
							line: location.line,
							column: location.column
						},
						pos,
						message: `Error when using sourcemap for reporting an error: ${e.message}`,
						code: 'SOURCEMAP_ERROR'
					},
					undefined
				);
			}

			props.loc = {
				file: this.id,
				line: location.line,
				column: location.column
			};
			props.frame = getCodeFrame(this.originalCode, location.line, location.column);
		}

		error(props);
	}

	getAllExports() {
		const allExports = Object.assign(Object.create(null), this.exports, this.reexports);

		this.exportAllModules.forEach(module => {
			if (module.isExternal) {
				allExports[`*${module.id}`] = true;
				return;
			}

			for (const name of (<Module>module).getAllExports()) {
				if (name !== 'default') allExports[name] = true;
			}
		});

		return Object.keys(allExports);
	}

	getExports() {
		return Object.keys(this.exports);
	}

	getReexports() {
		const reexports = Object.create(null);

		for (const name in this.reexports) {
			reexports[name] = true;
		}

		this.exportAllModules.forEach(module => {
			if (module.isExternal) {
				reexports[`*${module.id}`] = true;
				return;
			}

			for (const name of (<Module>module).getExports().concat((<Module>module).getReexports())) {
				if (name !== 'default') reexports[name] = true;
			}
		});

		return Object.keys(reexports);
	}

	includeAllInBundle() {
		includeFully(this.ast);
	}

	isIncluded() {
		return this.ast.included;
	}

	include(): boolean {
		this.needsTreeshakingPass = false;
		if (this.ast.shouldBeIncluded()) this.ast.include();
		return this.needsTreeshakingPass;
	}

	getOrCreateNamespace(): NamespaceVariable {
		if (this.namespaceVariable) return this.namespaceVariable;

		return (this.namespaceVariable = new NamespaceVariable(this.astContext, this));
	}

	private includeNamespace() {
		const namespace = this.getOrCreateNamespace();
		if (namespace.needsNamespaceBlock) return;

		let hasReexports = false;
		for (const importName in this.reexports) {
			hasReexports = true;
			const reexport = this.reexports[importName];
			this.imports[importName] = {
				source: reexport.source,
				start: reexport.start,
				name: reexport.localName,
				module: reexport.module
			};
			namespace.originals[importName] = reexport.module.traceExport(reexport.localName);
		}

		if (this.chunk && this.chunk.linked && hasReexports) this.chunk.linkModule(this);
	}

	render(options: RenderOptions): MagicString {
		const magicString = this.magicString.clone();
		this.ast.render(magicString, options);
		this.usesTopLevelAwait = this.astContext.usesTopLevelAwait;
		return magicString;
	}

	toJSON(): ModuleJSON {
		return {
			id: this.id,
			dependencies: this.dependencies.map(module => module.id),
			transformDependencies: this.transformDependencies,
			transformAssets: this.transformAssets,
			code: this.code,
			originalCode: this.originalCode,
			originalSourcemap: this.originalSourcemap,
			ast: this.esTreeAst,
			sourcemapChain: this.sourcemapChain,
			resolvedIds: this.resolvedIds,
			customTransformCache: this.customTransformCache
		};
	}

	traceVariable(name: string): Variable {
		// TODO this is slightly circular
		if (name in this.scope.variables) {
			return this.scope.variables[name];
		}

		if (name in this.imports) {
			const importDeclaration = this.imports[name];
			const otherModule = importDeclaration.module;

			if (!otherModule.isExternal && importDeclaration.name === '*') {
				return (<Module>otherModule).getOrCreateNamespace();
			}

			const declaration = otherModule.traceExport(importDeclaration.name);

			if (!declaration) {
				handleMissingExport(importDeclaration.name, this, otherModule.id, importDeclaration.start);
			}

			return declaration;
		}

		return null;
	}

	getRenderedExports() {
		// only direct exports are counted here, not reexports at all
		const renderedExports: string[] = [];
		const removedExports: string[] = [];
		for (const exportName in this.exports) {
			const expt = this.exports[exportName];
			(expt.node && expt.node.included ? renderedExports : removedExports).push(exportName);
		}
		return { renderedExports, removedExports };
	}

	traceExport(name: string, isExportAllSearch?: boolean): Variable {
		if (name[0] === '*') {
			// namespace
			if (name.length === 1) {
				return this.getOrCreateNamespace();
				// export * from 'external'
			} else {
				const module = <ExternalModule>this.graph.moduleById.get(name.slice(1));
				return module.traceExport('*');
			}
		}

		// export { foo } from './other'
		const reexportDeclaration = this.reexports[name];
		if (reexportDeclaration) {
			const declaration = reexportDeclaration.module.traceExport(reexportDeclaration.localName);

			if (!declaration) {
				handleMissingExport(
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
			const name = exportDeclaration.localName;
			const declaration = this.traceVariable(name) || this.graph.scope.findVariable(name);

			return declaration;
		}

		if (name !== 'default') {
			for (let i = 0; i < this.exportAllModules.length; i += 1) {
				const module = this.exportAllModules[i];
				const declaration = module.traceExport(name, true);

				if (declaration) return declaration;
			}
		}

		// we don't want to create shims when we are just
		// probing export * modules for exports
		if (this.graph.shimMissingExports && !isExportAllSearch) {
			return this.shimMissingExport(name);
		}
	}

	private warn(warning: RollupWarning, pos: number) {
		if (pos !== undefined) {
			warning.pos = pos;

			const { line, column } = locate(this.code, pos, { offsetLine: 1 }); // TODO trace sourcemaps, cf. error()

			warning.loc = { file: this.id, line, column };
			warning.frame = getCodeFrame(this.code, line, column);
		}

		warning.id = this.id;
		this.graph.warn(warning);
	}

	shimMissingExport(name: string) {
		// could have already been generated
		if (!this.exports[name])
			this.graph.warn({
				message: `Missing export "${name}" has been shimmed in module ${relativeId(this.id)}.`,
				code: 'SHIMMED_EXPORT',
				exportName: name,
				exporter: relativeId(this.id)
			});
		this.exports[name] = {
			localName: '_missingExportShim'
		};
		return this.graph.exportShimVariable;
	}
}
