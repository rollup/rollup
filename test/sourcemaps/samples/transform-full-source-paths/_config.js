const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'provides the full source map path when transforming source maps',
	options: {
		output: {
			name: 'myModule',
			file: path.join(__dirname, '_actual/bundle.js'),
			sourcemapPathTransform: (relativeSourcePath, sourcemapPath) =>
				path.resolve(path.dirname(sourcemapPath), relativeSourcePath)
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, [path.resolve(__dirname, 'main.js').replace(/\\/g, '/')]);
	}
});
