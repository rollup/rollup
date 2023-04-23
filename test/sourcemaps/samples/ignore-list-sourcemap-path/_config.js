const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'correctly passes source map path',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/output.js'),
			sourcemapIgnoreList: (relativeSourcePath, sourcemapPath) =>
				path.basename(sourcemapPath) === 'output.js.map' &&
				path.basename(path.dirname(sourcemapPath)) === '_actual' &&
				path.basename(relativeSourcePath) === 'main.js',
			sourcemapPathTransform: relativeSourcePath => path.basename(relativeSourcePath)
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['main.js']);
		assert.deepEqual(map.x_google_ignoreList, [0]);
	}
});
