module.exports = defineTest({
	description:
		'discards unused function expression assigned to a variable that calls itself and a global',
	expectedWarnings: ['EMPTY_BUNDLE']
});
