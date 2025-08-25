module.exports = defineTest({
	description: 'Remove the attribute declarations for internal dynamic imports',
	expectedWarnings: ['INVALID_IMPORT_ATTRIBUTE'],
	options: {
		plugins: [
			{
				resolveDynamicImport() {
					return { id: './foo.js' };
				}
			}
		]
	},
	verifyAst: false
});
