module.exports = defineTest({
	description: 'observes sourcemapFileNames property when using a function',
	options: {
		output: {
			sourcemap: true,
			entryFileNames: '[name].js',
			chunkFileNames: '[name]-[hash].js',
			sourcemapFileNames: ({ name }) => {
				switch (name) {
					case 'main': {
						// chunkhash should be empty string
						return 'main[chunkhash].js.map';
					}
					case 'dynamic': {
						return 'dynamic.js.map';
					}
					case 'dynamic-hashed': {
						return 'dynamic-[hash:12]-[chunkhash].js.map';
					}
					default: {
						throw new Error(`Unexpected name ${name}`);
					}
				}
			}
		}
	}
});
