module.exports = {
	description: 'chunk grouping size threshold',
	options: {
		optimizeChunks: true,
		chunkGroupingSize: 42,
		input: ['main1.js', 'main2.js', 'main3.js']
	}
};
