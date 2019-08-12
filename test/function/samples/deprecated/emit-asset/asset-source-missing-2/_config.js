module.exports = {
	description: 'throws when not setting the asset source and accessing the asset URL',
	options: {
		strictDeprecations: false,
		plugins: {
			name: 'test-plugin',
			load() {
				return `export default import.meta.ROLLUP_ASSET_URL_${this.emitAsset('test.ext')};`;
			}
		}
	},
	generateError: {
		code: 'ASSET_NOT_FINALISED',
		message:
			'Plugin error - Unable to get file name for asset "test.ext". Ensure that the source is set and that generate is called first.'
	}
};
