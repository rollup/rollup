module.exports = defineTest({
	description: 'Removes unused babel helpers from the build (#1595)',
	expectedWarnings: ['EMPTY_BUNDLE']
});
