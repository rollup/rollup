const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'populates ignore list',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/bundle.js'),
			sourcemapIgnoreList: sourcePath => sourcePath.includes('lib'),
			sourcemapPathTransform: sourcePath => path.basename(sourcePath)
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['lib1.js', 'lib2.js', 'main.js']);
		assert.deepEqual(map.x_google_ignoreList, [0, 1]);
	}
});
