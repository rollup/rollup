module.exports = defineTest({
	description: 'chunking external module handling',
	options: {
		input: ['main1.js', 'main2.js'],
		external: ['external']
	}
});
