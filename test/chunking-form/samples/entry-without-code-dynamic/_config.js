module.exports = defineTest({
	description:
		'optimizes chunks when a dynamic entry point without own code is imported from another entry',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
