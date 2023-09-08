const assert = require('node:assert');

module.exports = defineTest({
	description:
		'populates sourcemapFileName property of OutputChunk with final name when using sourcemapFileNames option',
	options: {
		output: {
			sourcemap: true,
			entryFileNames: '[name]-[hash]-[format].js',
			sourcemapFileNames: '[name]-[chunkhash]-[format]-[hash].js.map'
		},
		plugins: [
			{
				name: 'test-bundle',
				generateBundle(options, bundle) {
					const [sourcemapFileName, fileName] = Object.keys(bundle).sort();
					assert.strictEqual(bundle[fileName].sourcemapFileName, sourcemapFileName);
				}
			}
		]
	}
});
