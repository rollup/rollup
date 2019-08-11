module.exports = {
	description: 'throws for invalid asset ids',
	options: {
		strictDeprecations: false,
		plugins: {
			name: 'test-plugin',
			load() {
				return `export default import.meta.ROLLUP_ASSET_URL_invalid;`;
			}
		}
	},
	generateError: {
		code: 'FILE_NOT_FOUND',
		message: 'Plugin error - Unable to get file name for unknown file "invalid".'
	}
};
