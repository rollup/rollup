const assert = require('node:assert');

module.exports = defineTest({
	description:
		'populates sourcemapFileName property of OutputChunk with final name when using sourcemapFileNames option',
	options: {
		output: {
			entryFileNames: '[hash].js',
			sourcemapFileNames: '[chunkhash]-[hash].js',
			file: null,
			dir: '_actual'
		}
	},
	test: (code, map, { fileName, sourcemapFileName }) => {
		assert.notStrictEqual(fileName, sourcemapFileName);
	}
});
