module.exports = {
	description: 'throws when setting an empty asset source',
	options: {
		strictDeprecations: false,
		plugins: {
			name: 'test-plugin',
			buildStart() {
				const assetId = this.emitAsset('test.ext');
				this.setAssetSource(assetId, null);
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Plugin error creating asset "test.ext", setAssetSource call without a source.',
		plugin: 'test-plugin',
		pluginCode: 'ASSET_SOURCE_MISSING'
	}
};
