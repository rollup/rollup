module.exports = defineRollupTest({
	description: 'chunk with a namespace boundary',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
