const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'defaults to adding files within node_modules to the ignore list',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/bundle.js'),
			sourcemapPathTransform: sourcePath => path.basename(sourcePath)
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['lib.js', 'main.js']);
		assert.deepEqual(map.x_google_ignoreList, [0]);
	}
});
