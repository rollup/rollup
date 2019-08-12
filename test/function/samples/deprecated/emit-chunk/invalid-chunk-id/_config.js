module.exports = {
	description: 'throws for invalid chunk ids',
	options: {
		strictDeprecations: false,
		plugins: {
			name: 'test-plugin',
			load() {
				return `export default import.meta.ROLLUP_CHUNK_URL_invalid;`;
			}
		}
	},
	generateError: {
		code: 'FILE_NOT_FOUND',
		message: 'Plugin error - Unable to get file name for unknown file "invalid".'
	}
};
