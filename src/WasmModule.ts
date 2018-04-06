import { decode } from '@webassemblyjs/wasm-parser';
import ast from '@webassemblyjs/ast';

import Graph from './Graph';
import { IdMap, ModuleJSON, WebAssemblyJSAst } from './rollup/types';

import { makeLegal } from './utils/identifierHelpers';
import { RenderOptions } from './utils/renderHelpers';
import { basename, extname } from './utils/path';

import ExternalModule from './ExternalModule';
import Module from './Module';

import ModuleScope from './ast/scopes/ModuleScope';
import Variable from './ast/variables/Variable';
import NamespaceVariable from './ast/variables/NamespaceVariable';

const decoderOpts = {
	ignoreCodeSection: true,
	ignoreDataSection: true
};

const buildLoader = ({ NAME, URL, IMPORT_OBJECT }) => `
	// function then$${NAME}(resolve) {
	function then(resolve) {
		if (typeof WebAssembly.instantiateStreaming !== 'function') {
		  throw new Error('WebAssembly.instantiateStreaming is not supported');
		}

		if (typeof window.fetch !== 'function') {
		  throw new Error('window.fetch is not supported');
		}

		const req = window.fetch('${URL}');

		WebAssembly
			.instantiateStreaming(req, ${IMPORT_OBJECT || '{}'})
			.then(res => res.instance.exports)
			.then(resolve)
			.catch(resolve);
	}
`;

export interface ExportDescription {
	localName: string;
}

export interface ImportDescription {
	source: string;
	name: string;
	module: Module | ExternalModule | null;
}

export default class WasmModule {
	id: string;
	graph: Graph;
	code: Buffer;

	scope: ModuleScope;

	ast: WebAssemblyJSAst.Program;

	sources: string[];
	resolvedIds: IdMap;

	dynamicImportResolutions: {
		alias: string;
		resolution: Module | ExternalModule | string | void;
	}[];
	dependencies: (Module | ExternalModule | WasmModule)[];

	imports: { [name: string]: ImportDescription };
	exports: { [name: string]: ExportDescription };

	// this is unused on Module,
	// only used for namespace and then ExternalExport.declarations
	declarations: {
		'*'?: NamespaceVariable;
		[name: string]: Variable | undefined;
	};

	isExternal: false;

	constructor(graph: Graph, id: string) {
		this.id = id;
		this.graph = graph;
		this.code = new Buffer('');

		this.ast = null;

		// imports and exports, indexed by local name
		this.imports = Object.create(null);
		this.exports = Object.create(null);
		this.resolvedIds = Object.create(null);
		this.declarations = Object.create(null);

		// all dependencies
		this.dynamicImportResolutions = [];
		this.sources = [];
		this.dependencies = [];

		this.scope = new ModuleScope(this);

		// expose Thenable which is the entry point of our loader
		// this.exports['then$' + this.basename()] = {
		this.exports.then = {
			localName: 'then'
		};

		// FIXME(sven): a different then allows multiple wasm modules to be load
		// in the same chunk (avoids collision). I need to figure out how to
		// have an object like {then: then$foo} as the export;
	}

	render(options: RenderOptions) {
		const NAME = this.basename();
		const URL = `/dist/${NAME}.wasm`;

		const content = buildLoader({ URL, NAME });

		return { trim() {}, content };
	}

	getDynamicImportExpressions(): (string | Node)[] {
		// FIXME(sven): consider ModuleImport as dynamicImports?
		return [];
	}

	markExports() {}

	// TODO(sven): what is this?
	namespace(): NamespaceVariable {
		if (!this.declarations['*']) {
			this.declarations['*'] = new NamespaceVariable(this);
		}

		return this.declarations['*'];
	}

	basename() {
		const base = basename(this.id);
		const ext = extname(this.id);

		return makeLegal(ext ? base.slice(0, -ext.length) : base);
	}

	getExports() {
		return Object.keys(this.exports);
	}

	getReexports() {
		return [];
	}

	includeInBundle() {
		return false;
	}

	linkDependencies() {
		const { imports, exports } = this;

		ast.traverse(this.ast, {
			// ModuleImport({node}: any) {
			// 	const source = node.module
			// 	const name = node.name;
			// 	imports[`${source}.${name}`] = { source, name, module: null };
			// },
			// ModuleExport({node}: any) {
			// 	const name = node.name;
			// 	exports[name] = {
			// 		localName: name
			// 	};
			// }
		});
	}

	bindReferences() {}

	toJSON(): ModuleJSON {
		return {
			id: this.id,
			dependencies: this.dependencies.map(module => module.id),
			code: this.code,
			originalCode: '',
			originalSourcemap: undefined,
			ast: this.ast,
			sourcemapChain: null,
			resolvedIds: this.resolvedIds
		};
	}

	traceExport(name: string): Variable {
		return new Variable(name);
	}

	setSource(bin: Buffer) {
		this.code = bin;
		this.ast = decode(bin, decoderOpts);
	}
}
