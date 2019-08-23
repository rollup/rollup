module.exports = {
	solo: true,
	description: 'creates different hashes if the name pattern differs',
	options1: {
		input: 'main',
		output: {
			chunkFileNames: 'chunk-[name]'
		}
	},
	options2: {
		input: 'main',
		output: {
			chunkFileNames: '[name]-chunk'
		}
	}
};
