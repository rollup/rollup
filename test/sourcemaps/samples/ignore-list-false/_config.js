const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description:
		'accepts false for `sourcemapIgnoreList` to disable the default ignore-listing of node_modules',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/bundle.js'),
			sourcemapPathTransform: sourcePath => path.basename(sourcePath),
			sourcemapIgnoreList: false
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['lib.js', 'main.js']);
		assert.strictEqual(map.x_google_ignoreList, undefined);
	}
});
