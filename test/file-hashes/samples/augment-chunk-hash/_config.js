module.exports = {
	description: 'augmentChunkHash updates hashes across all modules when returning something',
	options1: {
		input: 'main',
		output: {
			format: 'esm',
			entryFileNames: '[name]-[hash].js',
			chunkFileNames: '[name]-[hash].js'
		},
		plugins: [
			{
				augmentChunkHash() {
					return 'bar';
				}
			}
		]
	},
	options2: {
		input: 'main',
		output: {
			format: 'esm',
			entryFileNames: '[name]-[hash].js',
			chunkFileNames: '[name]-[hash].js'
		},
		plugins: [
			{
				augmentChunkHash() {}
			}
		]
	}
};
