const path = require('path');

module.exports = {
	description: 'throws when adding watch files during generate',
	options: {
		plugins: {
			name: 'test-plugin',
			renderStart() {
				this.addWatchFile(path.join(__dirname, 'watched.js'));
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderStart',
		message: 'Cannot call addWatchFile after the build has finished.',
		plugin: 'test-plugin',
		pluginCode: 'INVALID_ROLLUP_PHASE'
	}
};
