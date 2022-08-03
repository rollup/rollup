const assert = require('assert');

const hooks = [
	'buildEnd',
	'buildStart',
	'generateBundle',
	'load',
	'moduleParsed',
	'options',
	'renderChunk',
	'renderStart',
	'resolveId',
	'transform'
];
// TODO Lukas
// closeBundle, closeWatcher, shouldTransformCachedModule, writeBundle, watchChange, renderError, resolveDynamicImport

const plugin = { name: 'test' };
const calledHooks = [];

for (const hook of hooks) {
	plugin[hook] = {
		handle() {
			calledHooks.push(hook);
		}
	};
}

module.exports = {
	// solo: true,
	description: 'supports using objects as hooks',
	options: {
		plugins: [plugin]
	},
	exports() {
		assert.deepStrictEqual(calledHooks, [
			'options',
			'buildStart',
			'resolveId',
			'load',
			'transform',
			'moduleParsed',
			'buildEnd',
			'renderStart',
			'renderChunk',
			'generateBundle'
		]);
	}
};
