module.exports = defineTest({
	description: 'throws when setting the asset source twice',
	options: {
		plugins: {
			name: 'test-plugin',
			buildEnd() {
				const assetId = this.emitFile({ type: 'asset' });
				this.setAssetSource(assetId, 'hello world');
				this.setAssetSource(assetId, 'another');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildEnd',
		message: 'Unable to set the source for asset "6b86b273", source already set.',
		plugin: 'test-plugin',
		pluginCode: 'ASSET_SOURCE_ALREADY_SET'
	}
});
