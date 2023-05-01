const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');

const ID_MAIN = path.join(__dirname, 'main.js');
const code = fs.readFileSync(ID_MAIN, 'utf8');

const hooks = [
	'augmentChunkHash',
	'buildEnd',
	'buildStart',
	'generateBundle',
	'load',
	'moduleParsed',
	'options',
	'outputOptions',
	'renderDynamicImport',
	'renderChunk',
	'renderStart',
	'resolveDynamicImport',
	'resolveFileUrl',
	'resolveId',
	'resolveImportMeta',
	'shouldTransformCachedModule',
	'transform'
];

const calledHooks = {};
for (const hook of hooks) {
	calledHooks[hook] = [];
}

const plugins = [
	{
		name: 'emitter',
		resolveId(source) {
			if (source === 'dep') {
				return source;
			}
		},
		load(source) {
			if (source === 'dep') {
				return `assert.okt(import.meta.url);\nassert.ok(import.meta.ROLLUP_FILE_URL_${this.emitFile(
					{
						type: 'asset',
						source: 'test'
					}
				)});`;
			}
		}
	}
];
addPlugin(null);
addPlugin('pre');
addPlugin('post');
addPlugin('post');
addPlugin('pre');
addPlugin();
function addPlugin(order) {
	const name = `${order}-${plugins.length}`;
	const plugin = { name };
	for (const hook of hooks) {
		plugin[hook] = {
			order,
			handler() {
				if (!calledHooks[hook].includes(name)) {
					calledHooks[hook].push(name);
				}
			}
		};
	}
	plugins.push(plugin);
}

module.exports = defineTest({
	description: 'allows to enforce plugin hook order',
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
});
