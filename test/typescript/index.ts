import type * as rollup from './dist/rollup';

// Plugin API
interface Options {
	extensions?: string | string[];
}

const plugin: rollup.PluginImpl<Options> = (options = {}) => {
	const _extensions = options.extensions || ['.js'];
	return {
		name: 'my-plugin',
		resolveId: {
			handler(source, _importer, _options) {
				// @ts-expect-error source is typed as string
				const _s: number = source;
			}
		}
	};
};

plugin();
plugin({ extensions: ['.js', 'json'] });

const _pluginHooks: rollup.Plugin = {
	buildStart: {
		handler() {},
		sequential: true
	},
	async load(id) {
		// @ts-expect-error id is typed as string
		const _index: number = id;
		await this.resolve('rollup');
	},
	name: 'test',
	renderChunk(_code, { modules }) {
		for (const id in modules) {
			// @ts-expect-error Cannot assign to 'code' because it is a read-only property
			modules[id].code += '\n';
		}
	},
	resolveId: {
		async handler(source, _importer, _options) {
			await this.resolve('rollup');
			// @ts-expect-error source is typed as string
			const _s: number = source;
		},
		// @ts-expect-error sequential is only supported for parallel hooks
		sequential: true
	}
};

const _pluginHookFilters: rollup.Plugin = {
	load: {
		filter: {
			// @ts-expect-error 'code' filter is not supported for load
			code: 'bar',
			id: 'foo'
		},
		handler(_source) {}
	},
	name: 'test',
	resolveId: {
		filter: {
			// @ts-expect-error 'code' filter is not supported for resolveId
			code: 'bar',
			id: /foo/
		},
		handler(_source) {}
	},
	transform: {
		filter: {
			code: 'bar',
			id: 'foo'
		},
		handler(_code) {}
	}
};

const _indexSourcemapPlugin: rollup.Plugin = {
	load() {
		return {
			code: '',
			map: {
				sections: [
					{
						map: { mappings: 'AAAA', names: [], sources: ['a.js'], version: 3 },
						offset: { column: 0, line: 0 }
					}
				],
				version: 3
			}
		};
	},
	name: 'test'
};

const _amdOutputOptions: rollup.OutputOptions['amd'][] = [
	{},
	{
		autoId: undefined,
		id: undefined
	},
	{
		id: 'a'
	},
	{
		autoId: undefined,
		id: 'a'
	},
	{
		autoId: false,
		id: 'a'
	},
	{
		autoId: true,
		basePath: 'a'
	},
	{
		autoId: true
	},
	{
		autoId: true,
		basePath: undefined,
		id: undefined
	},
	{
		autoId: false
	},
	{
		autoId: false,
		// @ts-expect-error for "basePath", "autoId" needs to be true
		basePath: '',
		id: 'a'
	},
	{
		autoId: true,
		// @ts-expect-error cannot combine "id" and "autoId"
		id: 'a'
	},
	{
		// @ts-expect-error cannot combine "id" and "basePath"
		basePath: '',
		id: 'a'
	},
	// @ts-expect-error needs "autoId" for "basePath"
	{
		basePath: ''
	}
];

const _nullSourcesPlugin: rollup.Plugin = {
	load() {
		return {
			code: '',
			map: { mappings: 'AAAA', names: [], sources: [null], sourcesContent: [null], version: 3 }
		};
	},
	name: 'test'
};

// Lazy AST parents
const _lazyAst: rollup.ast.LazyNode<rollup.ast.Program> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.Program>;
const _eagerAst: rollup.ast.Program = null as unknown as rollup.ast.Program;
const _lazyParent: rollup.ast.AstNode | null | undefined = _lazyAst.body[0].parent;
const _lazyParentType: string | null | undefined = _lazyAst.body[0].parent?.type;
const _lazyParentIsPresent: boolean = 'parent' in _lazyAst.body[0];
const _programParent: null | undefined = _lazyAst.parent;
// @ts-expect-error eager AST nodes do not have parents
const _eagerParent = _eagerAst.body[0].parent;

const _lazyDeclarator: rollup.ast.LazyNode<rollup.ast.VariableDeclarator> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.VariableDeclarator>;
const _declaratorParent: rollup.ast.VariableDeclaratorParent | null | undefined =
	_lazyDeclarator.parent;
const _declaratorParentType: string | null | undefined = _lazyDeclarator.parent?.type;
const _declaratorGrandParent: rollup.ast.AstNode | null | undefined =
	_lazyDeclarator.parent?.parent;

const _walkHandler: rollup.ParseAndWalkHandler<rollup.ast.VariableDeclarator> = (node, api) => {
	const _parent: rollup.ast.VariableDeclaratorParent | null | undefined = node.parent;
	const _idParent: rollup.ast.AstNode | null | undefined = node.id.parent;
	const _idType: string = node.id.type;
	api.parseChildren();
};
