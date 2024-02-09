module.exports = defineTest({
	description: 'supports hex hashes',
	options: {
		input: ['main1.js', 'main2.js'],
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({ type: 'asset', name: 'test.txt', source: 'test' });
				}
			}
		],
		output: {
			entryFileNames: ({ name }) => (name === 'main1' ? '[name]-[hash:8].js' : '[name]-[hash].js'),
			chunkFileNames: '[name]-[hash:14].js',
			assetFileNames: '[name]-[hash:18][extname]',
			hashCharacters: 'hex'
		}
	}
});
