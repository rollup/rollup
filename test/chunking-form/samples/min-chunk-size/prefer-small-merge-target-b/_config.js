module.exports = defineTest({
	description: 'when there are two equally valid merge targets, the smaller is preferred',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js', 'main4.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
