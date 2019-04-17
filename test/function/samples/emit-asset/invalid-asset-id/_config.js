module.exports = {
	description: 'throws for invalid asset ids',
	options: {
		plugins: {
			name: 'test-plugin',
			load() {
				return `export default import.meta.ROLLUP_ASSET_URL_invalid;`;
			}
		}
	},
	generateError: {
		code: 'ASSET_NOT_FOUND',
		message: 'Plugin error - Unable to get asset filename for unknown asset "invalid".'
	}
};
