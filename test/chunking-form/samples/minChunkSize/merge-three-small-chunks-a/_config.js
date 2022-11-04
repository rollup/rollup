module.exports = {
	solo: true,
	description: 'merges small chunks into other small chunks first before merging into a big chunk',
	options: {
		input: ['main1.js', 'main2.js', 'main3.js', 'main4.js', 'main5.js'],
		output: {
			experimentalMinChunkSize: 100
		}
	}
};
