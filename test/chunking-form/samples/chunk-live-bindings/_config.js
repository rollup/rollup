module.exports = defineTest({
	description: 'ES module live bindings in chunks',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main1.js', 'main2.js']
	}
});
