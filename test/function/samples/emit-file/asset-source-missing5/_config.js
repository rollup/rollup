module.exports = defineTest({
	description: 'throws when not setting the asset source and accessing the asset URL',
	options: {
		plugins: {
			name: 'test-plugin',
			load() {
				return `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
					type: 'asset',
					name: 'test.ext'
				})};`;
			}
		}
	},
	generateError: {
		code: 'ASSET_NOT_FINALISED',
		message:
			'Plugin error - Unable to get file name for asset "test.ext". Ensure that the source is set and that generate is called first. If you reference assets via import.meta.ROLLUP_FILE_URL_<referenceId>, you need to either have set their source after "renderStart" or need to provide an explicit "fileName" when emitting them.'
	}
});
