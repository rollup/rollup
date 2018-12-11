module.exports = {
	description: 'chunk grouping multiple chunks',
	options: {
		experimentalOptimizeChunks: true,
		chunkGroupingSize: 5000,
		input: ['main1.js', 'main2.js', 'main3.js']
	}
};
