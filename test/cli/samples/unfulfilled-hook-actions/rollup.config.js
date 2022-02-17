const path = require('path');
const acorn = require('acorn');

function relative(id) {
	if (id[0] !== '/') return id;
	if (id[0] !== '\\') return id;
	return './' + path.relative(process.cwd(), id);
}

const moduleECode = "console.log('e');\n";

module.exports = {
	input: 'main.js',
	cache: {
		modules: [
			{
				id: './e.js',
				ast: acorn.parse(moduleECode, {
					ecmaVersion: 6,
					sourceType: 'module'
				}),
				code: moduleECode,
				dependencies: [],
				customTransformCache: false,
				originalCode: moduleECode,
				originalSourcemap: null,
				resolvedIds: {},
				sourcemapChain: [],
				transformDependencies: []
			}
		]
	},
	plugins: [
		{
			name: 'buggy-plugin',
			resolveId(id) {
				if (id.includes('\0')) return;

				// this action will never resolve or reject
				if (id.endsWith('c.js')) return new Promise(() => {});

				return relative(id);
			},
			load(id) {
				// this action will never resolve or reject
				if (id.endsWith('b.js')) return new Promise(() => {});
			},
			transform(code, id) {
				// this action will never resolve or reject
				if (id.endsWith('a.js')) return new Promise(() => {});
			},
			moduleParsed({ id }) {
				// this action will never resolve or reject
				if (id.endsWith('d.js')) return new Promise(() => {});
			},
			shouldTransformCachedModule({ id }) {
				// this action will never resolve or reject
				if (id.endsWith('e.js')) return new Promise(() => {});
			}
		}
	],
	output: {
		format: 'es'
	}
};
