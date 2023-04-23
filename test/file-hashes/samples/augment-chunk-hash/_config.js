const augment1 = '/*foo*/';
const augment2 = '/*bar*/';

module.exports = defineTest({
	description: 'augmentChunkHash updates hashes across all modules when returning something',
	options1: {
		input: 'main',
		output: {
			format: 'es',
			entryFileNames: '[name]-[hash].js',
			chunkFileNames: '[name]-[hash].js'
		},
		plugins: [
			{
				augmentChunkHash(chunk) {
					if (chunk.name === 'main') {
						return augment1;
					}
				},
				renderChunk(code, chunk) {
					if (chunk.name === 'main') {
						return augment1 + code;
					}
				}
			}
		]
	},
	options2: {
		input: 'main',
		output: {
			format: 'es',
			entryFileNames: '[name]-[hash].js',
			chunkFileNames: '[name]-[hash].js'
		},
		plugins: [
			{
				augmentChunkHash(chunk) {
					if (chunk.name === 'main') {
						return augment2;
					}
				},
				renderChunk(code, chunk) {
					if (chunk.name === 'main') {
						return augment2 + code;
					}
				}
			}
		]
	}
});
