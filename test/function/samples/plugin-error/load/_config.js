const path = require('path');

module.exports = {
	description: 'buildStart hooks can use this.error',
	options: {
		plugins: [
			{
				name: 'test',
				load() {
					this.error('nope');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: `Could not load ${path.join(__dirname, 'main.js')}: nope`,
		hook: 'load',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
};
