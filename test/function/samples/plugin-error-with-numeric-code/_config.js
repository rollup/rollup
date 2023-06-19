const path = require('node:path');

module.exports = defineTest({
	description: 'rollup do not break if get a plugin error that contains numeric code',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					const error = new Error('test message');
					error.code = 100;
					throw error;
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		message: 'test message',
		plugin: 'test',
		pluginCode: 100,
		watchFiles: [path.join(__dirname, 'main.js')]
	}
});
