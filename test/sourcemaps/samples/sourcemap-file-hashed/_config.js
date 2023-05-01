const assert = require('node:assert');

module.exports = defineTest({
	description: 'populates file property of sourcemap with final name when using hashes',
	options: {
		output: {
			entryFileNames: '[hash].js',
			file: null,
			dir: '_actual'
		}
	},
	test: (code, map, { fileName }) => {
		assert.strictEqual(map.file, fileName);
	}
});
