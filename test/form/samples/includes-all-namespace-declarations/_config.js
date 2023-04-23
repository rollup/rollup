module.exports = defineRollupTest({
	description: 'includes all declarations referenced by reified namespaces',
	expectedWarnings: ['EMPTY_BUNDLE']
});
