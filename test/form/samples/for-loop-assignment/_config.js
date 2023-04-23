module.exports = defineRollupTest({
	description: 'removes assignments with computed indexes in for loops',
	expectedWarnings: ['EMPTY_BUNDLE']
});
