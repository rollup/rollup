module.exports = defineRollupTest({
	description: 'handle namespace imports from chunks',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
