module.exports = defineTest({
	description: 'detects side-effects in circular function calls',
	expectedWarnings: ['CIRCULAR_DEPENDENCY']
});
