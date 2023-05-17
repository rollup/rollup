module.exports = defineTest({
	description: 'takes tree-shaking into account and ignores top-level comments',
	options: {
		input: ['main1.js', 'main2.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
