const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'transform sourcemap paths (#2168)',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/bundle.js'),
			sourcemapPathTransform: sourcePath => sourcePath.replace(
				`..${path.sep}`,
				'~/pkg-name/'
			)
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['~/pkg-name/main.js']);
	}
};
