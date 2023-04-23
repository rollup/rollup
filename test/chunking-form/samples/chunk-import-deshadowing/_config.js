module.exports = defineRollupTest({
	description: 'chunk import deshadowing',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
