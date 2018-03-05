import { IParse, Options as AcornOptions } from 'acorn';
import MagicString from 'magic-string';
import { locate } from 'locate-character';
import { timeEnd, timeStart } from './utils/flushTime';
import { blank } from './utils/object';
import { basename, extname } from './utils/path';
import { makeLegal } from './utils/identifierHelpers';
import getCodeFrame from './utils/getCodeFrame';
import { SOURCEMAPPING_URL_RE } from './utils/sourceMappingURL';
import error, { RollupError } from './utils/error';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import extractNames from './ast/utils/extractNames';
import enhance from './ast/enhance';
import clone from './ast/clone';
import ModuleScope from './ast/scopes/ModuleScope';
import { encode } from 'sourcemap-codec';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import ImportSpecifier from './ast/nodes/ImportSpecifier';
import Graph from './Graph';
import Variable from './ast/variables/Variable';
import Program from './ast/nodes/Program';
import VariableDeclarator from './ast/nodes/VariableDeclarator';
import { Node } from './ast/nodes/shared/Node';
import ExportNamedDeclaration from './ast/nodes/ExportNamedDeclaration';
import ImportDeclaration from './ast/nodes/ImportDeclaration';
import Identifier from './ast/nodes/Identifier';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import FunctionDeclaration from './ast/nodes/FunctionDeclaration';
import ExportAllDeclaration from './ast/nodes/ExportAllDeclaration';
import ImportDefaultSpecifier from './ast/nodes/ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ast/nodes/ImportNamespaceSpecifier';
import { RollupWarning } from './rollup/index';
import ExternalModule from './ExternalModule';
import ExternalVariable from './ast/variables/ExternalVariable';
import Import from './ast/nodes/Import';
import { NodeType } from './ast/nodes/index';
import { isTemplateLiteral } from './ast/nodes/TemplateLiteral';
import { isLiteral } from './ast/nodes/Literal';
import Chunk from './Chunk';
import { RenderOptions } from './utils/renderHelpers';

export interface IdMap {
	[key: string]: string;
}

export interface CommentDescription {
	block: boolean;
	text: string;
	start: number;
	end: number;
}

export interface ImportDescription {
	source: string;
	specifier: ImportSpecifier | ImportNamespaceSpecifier | ImportDefaultSpecifier;
	name: string;
	module: Module | ExternalModule | null;
}

export interface ExportDescription {
	localName: string;
	identifier?: string;
}

export interface ReexportDescription {
	localName: string;
	start: number;
	source: string;
	module: Module;
}

export const defaultAcornOptions: AcornOptions = {
	// TODO TypeScript waiting for acorn types to be updated
	ecmaVersion: <any>2018,
	sourceType: 'module',
	preserveParens: false
};

function tryParse(module: Module, parse: IParse, acornOptions: AcornOptions) {
	try {
		return parse(
			module.code,
			Object.assign({}, defaultAcornOptions, acornOptions, {
				onComment: (block: boolean, text: string, start: number, end: number) =>
					module.comments.push({ block, text, start, end })
			})
		);
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
		node.variable.includeVariable();
	}
	node.eachChild(includeFully);
}

export interface ModuleJSON {
	id: string;
	dependencies: string[];
	code: string;
	originalCode: string;
	originalSourcemap: RawSourceMap | void;
	ast: Program;
	sourcemapChain: RawSourceMap[];
	resolvedIds: IdMap;
}

export default class Module {
	type: 'Module';
	graph: Graph;
	code: string;
	comments: CommentDescription[];
	context: string;
	dependencies: (Module | ExternalModule)[];
	excludeFromSourcemap: boolean;
	exports: { [name: string]: ExportDescription };
	exportsAll: { [name: string]: string };
	exportAllSources: string[];
	id: string;

	imports: { [name: string]: ImportDescription };
	isExternal: false;
	magicString: MagicString;
	originalCode: string;
	originalSourcemap: RawSourceMap | void;
	reexports: { [name: string]: ReexportDescription };
	resolvedIds: IdMap;
	scope: ModuleScope;
	sourcemapChain: RawSourceMap[];
	sources: string[];
	dynamicImports: Import[];
	dynamicImportResolutions: (Module | ExternalModule | string | void)[];

	execIndex: number;
	isEntryPoint: boolean;
	entryPointsHash: Uint8Array;
	chunk: Chunk;

	ast: Program;
	private astClone: Program;

	// this is unused on Module,
	// only used for namespace and then ExternalExport.declarations
	declarations: {
		'*'?: NamespaceVariable;
		[name: string]: Variable | undefined;
	};
	exportAllModules: (Module | ExternalModule)[];

	constructor(graph: Graph, id: string) {
		this.id = id;
		this.graph = graph;
		this.comments = [];

		if (graph.dynamicImport) {
			this.dynamicImports = [];
			this.dynamicImportResolutions = [];
		}
		this.isEntryPoint = false;
		this.execIndex = null;
		this.entryPointsHash = new Uint8Array(10);

		this.excludeFromSourcemap = /\0/.test(id);
		this.context = graph.getModuleContext(id);

		// all dependencies
		this.sources = [];
		this.dependencies = [];

		// imports and exports, indexed by local name
		this.imports = blank();
		this.exports = blank();
		this.exportsAll = blank();
		this.reexports = blank();

		this.exportAllSources = [];
		this.exportAllModules = null;

		this.declarations = blank();
		this.scope = new ModuleScope(this);
	}

	setSource({
		code,
		originalCode,
		originalSourcemap,
		ast,
		sourcemapChain,
		resolvedIds
	}: {
		code: string;
		originalCode: string;
		originalSourcemap: RawSourceMap;
		ast: Program;
		sourcemapChain: RawSourceMap[];
		resolvedIds?: IdMap;
	}) {
		this.code = code;
		this.originalCode = originalCode;
		this.originalSourcemap = originalSourcemap;
		this.sourcemapChain = sourcemapChain;

		timeStart('ast');

		if (ast) {
			// prevent mutating the provided AST, as it may be reused on
			// subsequent incremental rebuilds
			this.ast = clone(ast);
			this.astClone = ast;
		} else {
			// TODO what happens to comments if AST is provided?
			this.ast = <any>tryParse(this, this.graph.acornParse, this.graph.acornOptions);
			this.astClone = clone(this.ast);
		}

		timeEnd('ast');

		this.resolvedIds = resolvedIds || blank();

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		this.magicString = new MagicString(code, {
			filename: this.excludeFromSourcemap ? null : this.id, // don't include plugin helpers in sourcemap
			indentExclusionRanges: []
		});
		this.removeExistingSourceMap();

		timeStart('analyse');

		this.analyse();

		timeEnd('analyse');
	}

	private removeExistingSourceMap() {
		this.comments.forEach(comment => {
			if (!comment.block && SOURCEMAPPING_URL_RE.test(comment.text)) {
				this.magicString.remove(comment.start, comment.end);
			}
		});
	}

	private addExport(node: ExportAllDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration) {
		const source = (<ExportAllDeclaration>node).source && (<ExportAllDeclaration>node).source.value;

		// export { name } from './other'
		if (source) {
			if (this.sources.indexOf(source) === -1) this.sources.push(source);

			if (node.type === NodeType.ExportAllDeclaration) {
				// Store `export * from '...'` statements in an array of delegates.
				// When an unknown import is encountered, we see if one of them can satisfy it.
				this.exportAllSources.push(source);
			} else {
				(<ExportNamedDeclaration>node).specifiers.forEach(specifier => {
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
				});
			}
		} else if (node.type === NodeType.ExportDefaultDeclaration) {
			// export default function foo () {}
			// export default foo;
			// export default 42;
			const identifier =
				((<FunctionDeclaration>(<ExportDefaultDeclaration>node).declaration).id &&
					(<FunctionDeclaration>(<ExportDefaultDeclaration>node).declaration).id.name) ||
				(<Identifier>(<ExportDefaultDeclaration>node).declaration).name;
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
				identifier
			};
		} else if ((<ExportNamedDeclaration>node).declaration) {
			// export var { foo, bar } = ...
			// export var foo = 42;
			// export var a = 1, b = 2, c = 3;
			// export function foo () {}
			const declaration = (<ExportNamedDeclaration>node).declaration;

			if (declaration.type === NodeType.VariableDeclaration) {
				declaration.declarations.forEach((decl: VariableDeclarator) => {
					extractNames(decl.id).forEach(localName => {
						this.exports[localName] = { localName };
					});
				});
			} else {
				// export function foo () {}
				const localName = declaration.id.name;
				this.exports[localName] = { localName };
			}
		} else {
			// export { foo, bar, baz }
			(<ExportNamedDeclaration>node).specifiers.forEach(specifier => {
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

				this.exports[exportedName] = { localName };
			});
		}
	}

	private addImport(node: ImportDeclaration) {
		const source = node.source.value;

		if (this.sources.indexOf(source) === -1) this.sources.push(source);

		node.specifiers.forEach(specifier => {
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

			const name = isDefault ? 'default' : isNamespace ? '*' : (<ImportSpecifier>specifier).imported.name;
			this.imports[localName] = { source, specifier, name, module: null };
		});
	}

	private analyse() {
		enhance(this.ast, this, this.dynamicImports);
		this.ast.body.forEach(node => {
			if ((<ImportDeclaration>node).isImportDeclaration) {
				this.addImport(<ImportDeclaration>node);
			} else if ((<ExportDefaultDeclaration | ExportNamedDeclaration | ExportAllDeclaration>node).isExportDeclaration) {
				this.addExport(<ExportDefaultDeclaration | ExportNamedDeclaration | ExportAllDeclaration>node);
			}
		});
	}

	basename() {
		const base = basename(this.id);
		const ext = extname(this.id);

		return makeLegal(ext ? base.slice(0, -ext.length) : base);
	}

	markExports() {
		this.getExports().forEach(name => {
			const variable = this.traceExport(name);

			variable.exportName = name;
			variable.includeVariable();

			if (variable.isNamespace) {
				(<NamespaceVariable>variable).needsNamespaceBlock = true;
			}
		});

		this.getReexports().forEach(name => {
			const variable = this.traceExport(name);

			variable.exportName = name;

			if (variable.isExternal) {
				variable.reexported = (<ExternalVariable>variable).module.reexported = true;
			} else {
				variable.includeVariable();
			}
		});
	}

	linkDependencies() {
		this.sources.forEach(source => {
			const id = this.resolvedIds[source];

			if (id) {
				const module = this.graph.moduleById.get(id);
				this.dependencies.push(<Module>module);
			}
		});

		[this.imports, this.reexports].forEach(specifiers => {
			Object.keys(specifiers).forEach(name => {
				const specifier = specifiers[name];

				const id = this.resolvedIds[specifier.source];
				specifier.module = this.graph.moduleById.get(id);
			});
		});

		this.exportAllModules = this.exportAllSources.map(source => {
			const id = this.resolvedIds[source];
			return this.graph.moduleById.get(id);
		});
	}

	bindReferences() {
		this.ast.body.forEach(node => node.bind());
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
					return <string>importArgument.value;
				}
			} else {
				return importArgument;
			}
		});
	}

	private getOriginalLocation(sourcemapChain: RawSourceMap[], location: { line: number; column: number }) {
		const filteredSourcemapChain = sourcemapChain.filter(sourcemap => sourcemap.mappings).map(sourcemap => {
			const encodedSourcemap = sourcemap;
			if (sourcemap.mappings) {
				encodedSourcemap.mappings = encode(encodedSourcemap.mappings);
			}
			return encodedSourcemap;
		});
		while (filteredSourcemapChain.length > 0) {
			const sourcemap = filteredSourcemapChain.pop();
			const smc = new SourceMapConsumer(sourcemap);
			location = smc.originalPositionFor({
				line: location.line,
				column: location.column
			});
		}
		return location;
	}

	error(props: RollupError, pos: number) {
		if (pos !== undefined) {
			props.pos = pos;

			let location = locate(this.code, pos, { offsetLine: 1 });
			try {
				location = this.getOriginalLocation(this.sourcemapChain, location);
			} catch (e) {
				this.warn(
					{
						loc: {
							file: this.id,
							line: location.line,
							column: location.column
						},
						pos: pos,
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
		const allExports = Object.assign(blank(), this.exports, this.reexports);

		this.exportAllModules.forEach(module => {
			if (module.isExternal) {
				allExports[`*${module.id}`] = true;
				return;
			}

			(<Module>module).getAllExports().forEach(name => {
				if (name !== 'default') allExports[name] = true;
			});
		});

		return Object.keys(allExports);
	}

	getExports() {
		return Object.keys(this.exports);
	}

	getReexports() {
		const reexports = blank();

		Object.keys(this.reexports).forEach(name => {
			reexports[name] = true;
		});

		this.exportAllModules.forEach(module => {
			if (module.isExternal) {
				reexports[`*${module.id}`] = true;
				return;
			}

			(<Module>module)
				.getExports()
				.concat((<Module>module).getReexports())
				.forEach(name => {
					if (name !== 'default') reexports[name] = true;
				});
		});

		return Object.keys(reexports);
	}

	includeAllInBundle() {
		this.ast.body.forEach(includeFully);
	}

	includeInBundle() {
		let addedNewNodes = false;
		this.ast.body.forEach((node: Node) => {
			if (node.shouldBeIncluded()) {
				if (node.includeInBundle()) {
					addedNewNodes = true;
				}
			}
		});
		return addedNewNodes;
	}

	namespace(): NamespaceVariable {
		if (!this.declarations['*']) {
			this.declarations['*'] = new NamespaceVariable(this);
		}

		return this.declarations['*'];
	}

	render(options: RenderOptions): MagicString {
		const magicString = this.magicString.clone();
		this.ast.render(magicString, options);

		if (this.namespace().needsNamespaceBlock) {
			magicString.append('\n\n' + this.namespace().renderBlock(options.legacy, options.freeze, '\t')); // TODO use correct indentation
		}

		// TODO TypeScript: It seems magicString is missing type information here
		return (<any>magicString).trim();
	}

	toJSON(): ModuleJSON {
		return {
			id: this.id,
			dependencies: this.dependencies.map(module => module.id),
			code: this.code,
			originalCode: this.originalCode,
			originalSourcemap: this.originalSourcemap,
			ast: this.astClone,
			sourcemapChain: this.sourcemapChain,
			resolvedIds: this.resolvedIds
		};
	}

	trace(name: string): Variable {
		// TODO this is slightly circular
		if (name in this.scope.variables) {
			return this.scope.variables[name];
		}

		if (name in this.imports) {
			const importDeclaration = this.imports[name];
			const otherModule = importDeclaration.module;

			if (!otherModule.isExternal && importDeclaration.name === '*') {
				return (<Module>otherModule).namespace();
			}

			const declaration = otherModule.traceExport(importDeclaration.name);

			if (!declaration) {
				this.graph.handleMissingExport(this, importDeclaration.name, otherModule, importDeclaration.specifier.start);
			}

			return declaration;
		}

		return null;
	}

	traceExport(name: string): Variable {
		if (name[0] === '*') {
			// namespace
			if (name.length === 1) {
				return this.namespace();
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
				this.graph.handleMissingExport(
					this,
					reexportDeclaration.localName,
					reexportDeclaration.module,
					reexportDeclaration.start
				);
			}

			return declaration;
		}

		const exportDeclaration = this.exports[name];
		if (exportDeclaration) {
			const name = exportDeclaration.localName;
			const declaration = this.trace(name);

			return declaration || this.graph.scope.findVariable(name);
		}

		if (name === 'default') return;

		for (let i = 0; i < this.exportAllModules.length; i += 1) {
			const module = this.exportAllModules[i];
			const declaration = module.traceExport(name);

			if (declaration) return declaration;
		}
	}

	warn(warning: RollupWarning, pos: number) {
		if (pos !== undefined) {
			warning.pos = pos;

			const { line, column } = locate(this.code, pos, { offsetLine: 1 }); // TODO trace sourcemaps, cf. error()

			warning.loc = { file: this.id, line, column };
			warning.frame = getCodeFrame(this.code, line, column);
		}

		warning.id = this.id;
		this.graph.warn(warning);
	}
}
