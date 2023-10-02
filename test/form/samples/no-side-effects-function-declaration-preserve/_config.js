module.exports = defineTest({
	description: 'preserve __NO_SIDE_EFFECTS__ annotations for function declarations',
	expectedWarnings: ['INVALID_ANNOTATION']
});
