module.exports = {
	description: 'marks this.isExternal as deprecated',
	options: {
		plugins: {
			buildStart() {
				this.isExternal('external');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The "this.isExternal" plugin context function used by plugin at position 1 is deprecated. The "this.resolve" plugin context function should be used instead.',
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE'
	}
};
