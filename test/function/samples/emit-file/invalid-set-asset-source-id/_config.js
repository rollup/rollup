module.exports = defineTest({
	description: 'throws for invalid asset ids',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.setAssetSource('invalid', 'content');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Plugin error - Unable to set the source for unknown asset "invalid".',
		plugin: 'test-plugin',
		pluginCode: 'ASSET_NOT_FOUND'
	}
});
