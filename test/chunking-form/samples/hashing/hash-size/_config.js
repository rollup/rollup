module.exports = defineTest({
	description: 'allows configurable hash size',
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
			entryFileNames: ({ name }) =>
				name === 'main1' ? '[name]-[hash:8].js' : '[name]-[hash:10].js',
			chunkFileNames: '[name]-[hash:14].js',
			assetFileNames: '[name]-[hash:22][extname]'
		}
	}
});
