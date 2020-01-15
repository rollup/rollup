module.exports = {
	skip: true, // TODO broken
	description: 'chunking circular entry points',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main1.js', 'main2.js']
	}
};
