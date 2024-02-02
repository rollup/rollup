module.exports = defineTest({
	description: 'throws when setting an empty asset source',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					const assetId = this.emitFile({ type: 'asset' });
					this.setAssetSource(assetId, null);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'Could not set source for asset "BY8ZiPAi", asset source needs to be a string, Uint8Array or Buffer.',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
