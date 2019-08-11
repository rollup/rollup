module.exports = {
	description: 'throws when accessing the file name before the asset source is set',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				const assetId = this.emitFile({ type: 'asset' });
				this.getFileName(assetId);
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'Plugin error - Unable to get file name for asset "d59386e0". Ensure that the source is set and that generate is called first.',
		plugin: 'test-plugin',
		pluginCode: 'ASSET_NOT_FINALISED'
	}
};
