module.exports = defineTest({
	description: 'names both plugins in the combined error when they throw plain errors',
	options: {
		plugins: [
			{
				name: 'primary',
				renderChunk() {
					throw new Error('rendering failed');
				}
			},
			{
				name: 'cleanup',
				renderError() {
					throw new Error('cleanup failed');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderChunk',
		message:
			"There was an error during rendering:\n  [plugin primary] rendering failed\nAdditionally, handling the error in the 'renderError' hook caused the following error:\n  [plugin cleanup] cleanup failed",
		plugin: 'primary'
	}
});
