module.exports = defineTest({
	description:
		'discards unused function expression assigned to a variable that calls itself and has side effects',
	expectedWarnings: ['EMPTY_BUNDLE']
});
