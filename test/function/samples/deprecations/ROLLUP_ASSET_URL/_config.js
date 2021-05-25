module.exports = {
	description: 'marks ROLLUP_ASSET_URL as deprecated',
	options: {
		plugins: {
			load() {
				return `export default import.meta.ROLLUP_ASSET_URL_${this.emitFile({
					type: 'asset',
					name: 'asset',
					source: 'asset'
				})};`;
			}
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'Using the "ROLLUP_ASSET_URL_" prefix to reference files is deprecated. Use the "ROLLUP_FILE_URL_" prefix instead.'
	}
};
