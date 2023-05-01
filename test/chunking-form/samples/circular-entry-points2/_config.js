module.exports = defineTest({
	description: 'does not create a facade for one circular entry point if possible',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main1.js', 'main2.js']
	}
});
