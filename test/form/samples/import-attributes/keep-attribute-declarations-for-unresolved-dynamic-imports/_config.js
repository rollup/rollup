module.exports = defineTest({
	description: 'Keep the attribute declarations for unresolved dynamic imports',
	expectedWarnings: ['INVALID_IMPORT_ATTRIBUTE'],
	verifyAst: false
});
