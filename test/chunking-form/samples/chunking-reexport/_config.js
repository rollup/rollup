module.exports = defineTest({
	description: 'chunking star external',
	options: {
		input: ['main1.js', 'main2.js'],
		external: ['external']
	}
});
