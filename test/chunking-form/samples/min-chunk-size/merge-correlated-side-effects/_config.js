module.exports = defineRollupTest({
	description: 'merges correlated side effects with pure chunks',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
