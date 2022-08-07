const assert = require('assert');
const { wait } = require('../../../utils');

const hooks = ['buildEnd', 'buildStart', 'moduleParsed', 'renderStart'];

const calledHooks = {};
for (const hook of hooks) {
	calledHooks[hook] = [];
}

const plugins = [];
addPlugin(null, false);
addPlugin('pre', false);
addPlugin('post', true);
addPlugin('post', false);
addPlugin('pre', true);
addPlugin(undefined, true);
addPlugin(null, false);
addPlugin('pre', true);
addPlugin('post', false);
addPlugin('post', true);
addPlugin('pre', false);
addPlugin(undefined, true);

let hookActive = false;
function addPlugin(order, sequential) {
	const name = `${order}-${sequential ? 'seq-' : ''}${plugins.length + 1}`;
	const plugin = { name };
	for (const hook of hooks) {
		plugin[hook] = {
			order,
			async handler() {
				if (!calledHooks[hook].includes(name)) {
					calledHooks[hook].push(name);
				}
				if (sequential) {
					if (hookActive) {
						throw new Error(`Detected parallel hook runs in ${hook}.`);
					}
					hookActive = true;
					await wait(0);
					hookActive = false;
				}
			},
			sequential
		};
	}
	plugins.push(plugin);
}

module.exports = {
	description: 'allows to enforce sequential plugin hook order for parallel plugin hooks',
	options: {
		plugins
	},
	exports() {
		for (const hook of hooks) {
			assert.deepStrictEqual(
				calledHooks[hook],
				[
					'pre-2',
					'pre-11',
					'null-1',
					'null-7',
					'post-4',
					'post-9',
					'pre-seq-5',
					'pre-seq-8',
					'undefined-seq-6',
					'undefined-seq-12',
					'post-seq-3',
					'post-seq-10'
				],
				hook
			);
		}
	}
};
