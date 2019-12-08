const path = require('path');

module.exports = {
	description: 'marks transform dependencies as deprecated',
	options: {
		plugins: {
			transform(code) {
				return { code, dependencies: [] };
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'transform',
		id: path.resolve(__dirname, 'main.js'),
		message:
			'Returning "dependencies" from the "transform" hook as done by plugin at position 1 is deprecated. The "this.addWatchFile" plugin context function should be used instead.',
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE',
		watchFiles: [path.resolve(__dirname, 'main.js')]
	}
};
