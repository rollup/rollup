module.exports = defineTest({
	description: 'Removes unused functions where the prototype is iterable',
	expectedWarnings: ['EMPTY_BUNDLE']
});
