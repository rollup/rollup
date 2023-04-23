module.exports = defineTest({
	description: 'discards function with no side-effects in imported module',
	expectedWarnings: ['EMPTY_BUNDLE']
});
