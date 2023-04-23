const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'transform sourcemap paths (#2168)',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/bundle.js'),
			sourcemapPathTransform: sourcePath => sourcePath.replace(`..${path.sep}`, '~/pkg-name/')
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['~/pkg-name/main.js']);
	}
});
