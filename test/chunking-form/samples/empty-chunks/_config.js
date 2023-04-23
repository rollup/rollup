module.exports = defineTest({
	description: 'empty chunk pruning',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		input: ['main1.js', 'main2.js']
	}
});
