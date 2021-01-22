const assert = require('assert');

module.exports = {
	description: 'source paths are relative to sourcemapFile for inlined sourcemap',
	options: {
		output: {
			file: null,
			name: 'Main',
			sourcemap: 'inline',
			sourcemapFile: 'dist/js/bundle.js'
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['../../main.js']);
	}
};
