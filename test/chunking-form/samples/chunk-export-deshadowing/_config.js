module.exports = defineTest({
	description: 'chunk export deshadowing',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main1.js', 'main2.js']
	}
});
