const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'preserves a renderStart error when renderError throws synchronously',
	options: {
		plugins: [
			{
				name: 'primary',
				renderStart() {
					this.error({ code: 'PRIMARY_FAILURE', message: 'rendering failed' });
				}
			},
			{
				name: 'cleanup',
				renderError(error) {
					assert.equal(error.message, '[plugin primary] rendering failed');
					assert.equal(error.hook, 'renderStart');
					this.error('cleanup failed');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderStart',
		message:
			"There was an error during rendering:\n  [plugin primary] rendering failed\nAdditionally, handling the error in the 'renderError' hook caused the following error:\n  [plugin cleanup] cleanup failed",
		plugin: 'primary',
		pluginCode: 'PRIMARY_FAILURE'
	}
});
