module.exports = defineTest({
	description: 'merges chunks if their dependency side effects are the same',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
