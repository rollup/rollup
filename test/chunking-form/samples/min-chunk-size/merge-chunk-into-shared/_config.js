module.exports = defineTest({
	description:
		'merges small chunks into shared chunks that are loaded by a super-set of entry points',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
