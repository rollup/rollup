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
const _lazyAstAsEager: rollup.ast.Program = _lazyAst;
const _eagerAst: rollup.ast.Program = null as unknown as rollup.ast.Program;
const _lazyParent: rollup.ast.LazyNode<
	rollup.ast.ParentOf<rollup.ast.Program['body'][number]>
> | null = _lazyAst.body[0].parent;
const _lazyParentType: string | undefined = _lazyAst.body[0].parent?.type;
const _programParent: null = _lazyAst.parent;
// @ts-expect-error eager AST nodes do not have parents
const _eagerParent = _eagerAst.body[0].parent;
// @ts-expect-error eager nodes are not lazy nodes
const _lazyIdentifier: rollup.ast.LazyNode<rollup.ast.Identifier> =
	null as unknown as rollup.ast.Identifier;

_lazyAst.body.forEach(statement => {
	const _statementParent: rollup.ast.LazyNode<
		rollup.ast.ParentOf<rollup.ast.Program['body'][number]>
	> | null = statement.parent;
});
const _bodyParentTypes: (string | null)[] = _lazyAst.body.map(
	statement => statement.parent?.type ?? null
);

const _lazyDeclarator: rollup.ast.LazyNode<rollup.ast.VariableDeclarator> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.VariableDeclarator>;
const _declaratorParent: rollup.ast.LazyNode<
	rollup.ast.ParentOf<rollup.ast.VariableDeclarator>
> | null = _lazyDeclarator.parent;
const _declaratorParentType: string | undefined = _lazyDeclarator.parent?.type;
if (_lazyDeclarator.parent?.type === 'VariableDeclaration') {
	const _declaratorGrandParent: rollup.ast.LazyNode<
		rollup.ast.ParentOf<rollup.ast.VariableDeclaration>
	> | null = _lazyDeclarator.parent.parent;
}

const _anyLiteralNode: rollup.ast.LazyNode<rollup.ast.Literal> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.Literal>;
const _anyLiteralParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.Literal>> | null =
	_anyLiteralNode.parent;
if (_anyLiteralParent && 'directive' in _anyLiteralParent) {
	const _directive: string = _anyLiteralParent.directive;
}

const _literalParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.Literal>> | null = (
	null as unknown as rollup.ast.LazyNode<rollup.ast.Literal>
).parent;
if (_literalParent?.type === 'BinaryExpression') {
	const _literalBinaryParent: rollup.ast.LazyNode<rollup.ast.BinaryExpression> = _literalParent;
}

const _binaryParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.BinaryExpression>> | null =
	(null as unknown as rollup.ast.LazyNode<rollup.ast.BinaryExpression>).parent;
if (_binaryParent?.type === 'BinaryExpression') {
	const _nestedBinaryParent: rollup.ast.LazyNode<rollup.ast.BinaryExpression> = _binaryParent;
}

const _nullableInitParent:
	rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.Expression>> | null | undefined = (
	null as unknown as rollup.ast.LazyNode<rollup.ast.VariableDeclarator>
).init?.parent;

const _jsx: rollup.ast.LazyNode<rollup.ast.JSXElement> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.JSXElement>;
const _jsxParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.JSXElement>> | null =
	_jsx.parent;
if (_jsxParent?.type === 'ExportDefaultDeclaration') {
	const _jsxExportParent: rollup.ast.LazyNode<rollup.ast.ExportDefaultDeclaration> = _jsxParent;
}

const _fragment: rollup.ast.LazyNode<rollup.ast.JSXOpeningFragment> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.JSXOpeningFragment>;
const _fragmentAttributesLength: number = _fragment.attributes.length;

const _jsxFragment: rollup.ast.LazyNode<rollup.ast.JSXFragment> =
	null as unknown as rollup.ast.LazyNode<rollup.ast.JSXFragment>;
const _jsxFragmentParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.JSXFragment>> | null =
	_jsxFragment.parent;
if (_jsxFragmentParent?.type === 'JSXAttribute') {
	const _jsxAttributeParent: rollup.ast.LazyNode<rollup.ast.JSXAttribute> = _jsxFragmentParent;
}
const _jsxAttributeValue: rollup.ast.JSXAttribute['value'] =
	null as unknown as rollup.ast.JSXFragment;

const _expressionParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.Expression>> | null = (
	null as unknown as rollup.ast.LazyNode<rollup.ast.Expression>
).parent;
if (_expressionParent?.type === 'ChainExpression') {
	const _chainExpressionParent: rollup.ast.LazyNode<rollup.ast.ChainExpression> = _expressionParent;
}

const _walkHandler: rollup.ParseAndWalkHandler<rollup.ast.VariableDeclarator> = (node, api) => {
	const _parent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.VariableDeclarator>> | null =
		node.parent;
	const _idParent: rollup.ast.LazyNode<rollup.ast.ParentOf<rollup.ast.Identifier>> | null =
		node.id.parent;
	const _idType: string = node.id.type;
	api.parseChildren();
};
