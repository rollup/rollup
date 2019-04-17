module.exports = {
	description: 'throws for invalid asset names',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitAsset('/test.ext', 'content');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'Plugin error creating asset, name "/test.ext" is not a plain (non relative or absolute URL) string name.',
		plugin: 'test-plugin',
		pluginCode: 'INVALID_ASSET_NAME'
	}
};
