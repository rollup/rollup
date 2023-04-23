module.exports = defineTest({
	description: 'Handle dynamic imports that are part of a static graph',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
