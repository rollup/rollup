module.exports = defineTest({
	description: 'supports custom asset file names',
	options: {
		input: ['main.js'],
		plugins: {
			transform() {
				this.emitFile({ type: 'asset', name: 'test.txt', source: 'hello world' });
				return null;
			}
		},
		output: {
			assetFileNames: '[ext]/[hash]-[name][extname]'
		}
	}
});
