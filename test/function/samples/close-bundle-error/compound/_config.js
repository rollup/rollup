const assert = require('node:assert/strict');
const { setImmediate } = require('node:timers/promises');

const hooks = [];
let buildError;
let cleanupError;

module.exports = defineTest({
	description: 'preserves the compound build and buildEnd error when closeBundle rejects',
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
		hook: 'buildStart',
		message:
			"There was an error during the build:\n  [plugin failure] build failed\nAdditionally, handling the error in the 'buildEnd' hook caused the following error:\n  [plugin failure] buildEnd failed",
		plugin: 'failure',
		pluginCode: 'PRIMARY_FAILURE'
	},
	after() {
		assert.equal(
			cleanupError.message,
			"There was an error during the build:\n  [plugin failure] build failed\nAdditionally, handling the error in the 'buildEnd' hook caused the following error:\n  [plugin failure] buildEnd failed"
		);
		assert.equal(buildError.message, '[plugin failure] build failed');
		assert.deepEqual(hooks, ['buildStart', 'buildEnd', 'closeBundle', 'cleanup finished']);
	}
});
