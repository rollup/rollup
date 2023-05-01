module.exports = defineTest({
	description: 'chunking circular entry points',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main1.js', 'main2.js']
	}
});
