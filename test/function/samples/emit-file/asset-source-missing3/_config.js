module.exports = defineTest({
	description: 'throws when accessing the file name before the asset source is set',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				const assetId = this.emitFile({ type: 'asset', name: 'test.ext' });
				this.getFileName(assetId);
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'Plugin error - Unable to get file name for asset "test.ext". Ensure that the source is set and that generate is called first. If you reference assets via import.meta.ROLLUP_FILE_URL_<referenceId>, you need to either have set their source after "renderStart" or need to provide an explicit "fileName" when emitting them.',
		plugin: 'test-plugin',
		pluginCode: 'ASSET_NOT_FINALISED'
	}
});
