module.exports = defineTest({
	description: 'discards a self-calling function without side-effects',
	expectedWarnings: ['EMPTY_BUNDLE']
});
