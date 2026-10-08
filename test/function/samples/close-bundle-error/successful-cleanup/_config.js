const assert = require('node:assert/strict');
const { setImmediate } = require('node:timers/promises');

const hooks = [];
let buildError;
let cleanupError;

module.exports = defineTest({
	description: 'preserves the build error after successful closeBundle cleanup',
	options: {
		plugins: [
			{
				name: 'failure',
				buildStart() {
					hooks.push('buildStart');
					this.error({ code: 'PRIMARY_FAILURE', message: 'build failed' });
				},
				buildEnd(error) {
					hooks.push('buildEnd');
					buildError = error;
				},
				async closeBundle(error) {
					hooks.push('closeBundle');
					cleanupError = error;
					await setImmediate();
					hooks.push('cleanup finished');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: '[plugin failure] build failed',
		plugin: 'failure',
		pluginCode: 'PRIMARY_FAILURE'
	},
	after() {
		assert.equal(cleanupError, buildError);
		assert.deepEqual(hooks, ['buildStart', 'buildEnd', 'closeBundle', 'cleanup finished']);
	}
});
