module.exports = defineTest({
	description:
		'when there are two valid merge targets, the one that is loaded under more similar conditions is preferred',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js', 'main4.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
});
