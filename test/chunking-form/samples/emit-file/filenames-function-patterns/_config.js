module.exports = {
	description: 'supports using a function that returns a pattern for FileNames',
	options: {
		input: ['main.js'],
		plugins: {
			transform() {
				this.emitFile({ type: 'asset', name: 'test.txt', source: 'hello world' });
				return null;
			}
		},
		output: {
			entryFileNames: ({ replacements, getFileInfo }) => `[name].js`,
			assetFileNames: ({ replacements, getFileInfo }) => '[ext]/[hash]-[name][extname]',
			chunkFileNames: ({ replacements, getFileInfo }) => 'chunk-[name]-[hash]-[format].js'
		}
	}
};
