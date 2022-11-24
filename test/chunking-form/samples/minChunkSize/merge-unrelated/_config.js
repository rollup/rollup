module.exports = {
	solo: true,
	description: 'merges unrelated small chunks if there is no better alternative',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
};
