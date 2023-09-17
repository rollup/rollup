module.exports = defineTest({
	description: 'throws for invalid reference ids',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load() {
					return `export default import.meta.ROLLUP_FILE_URL_invalid;`;
				}
			}
		]
	},
	generateError: {
		code: 'FILE_NOT_FOUND',
		message: 'Plugin error - Unable to get file name for unknown file "invalid".'
	}
});
