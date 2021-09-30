const path = require('path');

module.exports = {
	description: 'errors in moduleParsed abort the build',
	options: {
		plugins: [
			{
				name: 'testPlugin',
				moduleParsed() {
					throw new Error('broken');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'moduleParsed',
		message: 'broken',
		plugin: 'testPlugin',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
};
