module.exports = defineTest({
	description:
		'creates facades for all circular entry points if they become tainted by another entry',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		input: ['main1.js', 'main2.js', 'main3.js']
	}
});
