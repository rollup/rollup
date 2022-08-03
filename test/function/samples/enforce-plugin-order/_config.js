const assert = require('assert');
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ID_MAIN = path.join(__dirname, 'main.js');
const code = fs.readFileSync(ID_MAIN, 'utf8');

const hooks = [
	'generateBundle',
	'load',
	'options',
	'renderChunk',
	'resolveDynamicImport',
	'resolveId',
	'shouldTransformCachedModule',
	'transform'
];

const calledHooks = {};

for (const hook of hooks) {
	calledHooks[hook] = [];
}

const plugins = [];

function addPlugin(enforceOrder) {
	const name = `${enforceOrder}-${plugins.length + 1}`;
	const plugin = { name };
	for (const hook of hooks) {
		plugin[hook] = {
			enforceOrder,
			handle() {
				if (!calledHooks[hook].includes(name)) {
					calledHooks[hook].push(name);
				}
			}
		};
	}
	plugins.push(plugin);
}

addPlugin(null);
addPlugin('pre');
addPlugin('post');
addPlugin('post');
addPlugin('pre');
addPlugin(undefined);

module.exports = {
	description: 'allows to enforce plugin order',
	options: {
		plugins,
		cache: {
			modules: [
				{
					id: ID_MAIN,
					ast: acorn.parse(code, {
						ecmaVersion: 2020,
						sourceType: 'module'
					}),
					code,
					dependencies: [],
					dynamicDependencies: [],
					originalCode: code,
					resolvedIds: {},
					sourcemapChain: [],
					transformDependencies: []
				}
			]
		}
	},
	exports() {
		for (const hook of hooks) {
			assert.deepStrictEqual(
				calledHooks[hook],
				['pre-2', 'pre-5', 'null-1', 'undefined-6', 'post-3', 'post-4'],
				hook
			);
		}
	}
};
