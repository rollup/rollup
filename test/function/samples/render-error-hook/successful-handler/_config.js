const assert = require('node:assert/strict');
const { setImmediate } = require('node:timers/promises');

module.exports = defineTest({
	description: 'reports the original render error after its handler completes successfully',
	options: {
		plugins: [
			{
				name: 'primary',
				renderChunk() {
					this.error({ code: 'PRIMARY_FAILURE', message: 'chunk rendering failed' });
				},
				async renderError(error) {
					await setImmediate();
					assert.equal(error.message, '[plugin primary] chunk rendering failed');
					assert.equal(error.pluginCode, 'PRIMARY_FAILURE');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderChunk',
		message: '[plugin primary] chunk rendering failed',
		plugin: 'primary',
		pluginCode: 'PRIMARY_FAILURE'
	}
});
