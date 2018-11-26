module.exports = {
	description: 'includes chained dynamic imports',
	options: {
		input: 'main.js',
		output: {
			chunkFileNames: 'generated-chunk.js'
		}
	}
};
