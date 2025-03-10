const assert = require('node:assert');
const { wait } = require('../../../testHelpers');

const hooks = [
	'banner',
	'buildEnd',
	'buildStart',
	'footer',
	'intro',
	'moduleParsed',
	'outro',
	'renderStart'
];

const calledHooks = {};
const activeHooks = {};
for (const hook of hooks) {
	calledHooks[hook] = [];
	activeHooks[hook] = new Set();
}

const plugins = [];
addPlugin(null, true);
addPlugin('pre', false);
addPlugin('post', false);
addPlugin('post', false);
addPlugin('pre', false);
addPlugin(undefined, true);
addPlugin(null, false);
addPlugin('pre', true);
addPlugin('post', true);
addPlugin('post', true);
addPlugin('pre', true);
addPlugin(undefined, false);

function addPlugin(order, sequential) {
	const name = `${order}-${sequential ? 'seq-' : ''}${plugins.length + 1}`;
	const plugin = { name };
	for (const hook of hooks) {
		plugin[hook] = {
			order,
			async handler() {
				const active = activeHooks[hook];
				if (!calledHooks[hook].includes(name)) {
					calledHooks[hook].push(sequential ? name : [name, [...active]]);
				}
				if (sequential && active.size > 0) {
					throw new Error(`Detected parallel hook runs in ${hook}.`);
				}
				active.add(name);
				// A setTimeout always takes longer than any chain of immediately
				// resolved promises
				await wait(0);
				active.delete(name);
			},
			sequential
		};
	}
	plugins.push(plugin);
}

module.exports = defineTest({
	description: 'allows to enforce sequential plugin hook order for parallel plugin hooks',
	options: {
		plugins
	},
	exports() {
		for (const hook of hooks) {
			assert.deepStrictEqual(
				calledHooks[hook],
				[
					['pre-2', []],
					['pre-5', ['pre-2']],
					'pre-seq-8',
					'pre-seq-11',
					'null-seq-1',
					'undefined-seq-6',
					['null-7', []],
					['undefined-12', ['null-7']],
					['post-3', ['null-7', 'undefined-12']],
					['post-4', ['null-7', 'undefined-12', 'post-3']],
					'post-seq-9',
					'post-seq-10'
				],
				hook
			);
		}
	}
});
