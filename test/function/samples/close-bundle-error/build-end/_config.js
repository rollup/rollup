const assert = require('node:assert/strict');
const { setImmediate } = require('node:timers/promises');

const hooks = [];
let buildError;
let cleanupError;

module.exports = defineTest({
	description: 'preserves the buildEnd error when closeBundle rejects',
	options: {
		plugins: [
			{
				name: 'failure',
				buildEnd(error) {
					hooks.push('buildEnd');
					buildError = error;
					this.error({ code: 'PRIMARY_FAILURE', message: 'buildEnd failed' });
				},
				async closeBundle(error) {
					hooks.push('closeBundle');
					cleanupError = error;
					await setImmediate();
					hooks.push('cleanup finished');
					this.error('cleanup failed');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildEnd',
		message: '[plugin failure] buildEnd failed',
		plugin: 'failure',
		pluginCode: 'PRIMARY_FAILURE'
	},
	after() {
		assert.equal(buildError, undefined);
		assert.equal(cleanupError.message, '[plugin failure] buildEnd failed');
		assert.deepEqual(hooks, ['buildEnd', 'closeBundle', 'cleanup finished']);
	}
});
