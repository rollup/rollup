const assert = require('node:assert/strict');
const { setImmediate } = require('node:timers/promises');

module.exports = defineTest({
	description: 'preserves a renderChunk error when renderError rejects asynchronously',
	options: {
		plugins: [
			{
				name: 'primary',
				renderChunk() {
					this.error({ code: 'PRIMARY_FAILURE', message: 'chunk rendering failed' });
				}
			},
			{
				name: 'cleanup',
				async renderError(error) {
					assert.equal(error.message, '[plugin primary] chunk rendering failed');
					assert.equal(error.hook, 'renderChunk');
					await setImmediate();
					this.error('async cleanup failed');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderChunk',
		message:
			"There was an error during rendering:\n  [plugin primary] chunk rendering failed\nAdditionally, handling the error in the 'renderError' hook caused the following error:\n  [plugin cleanup] async cleanup failed",
		plugin: 'primary',
		pluginCode: 'PRIMARY_FAILURE'
	}
});
