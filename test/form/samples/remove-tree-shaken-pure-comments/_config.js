module.exports = defineTest({
	description: 'removes pure comments of tree-shaken nodes',
	expectedWarnings: ['INVALID_ANNOTATION']
});
