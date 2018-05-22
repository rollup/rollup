const assert = require('assert');
const path = require('path');
const { URL } = require('url');

module.exports = {
	description: 'import.meta.url support',
	options: {
		experimentalDynamicImport: true
	},
	bundleOptions: {
		compact: true
	},
	context: {
		__filename: path.resolve(__dirname, 'test.js'),
		require: require
	},
	exports (exports) {
		assert.equal(exports, new URL('file:' + path.resolve(__dirname, 'test.js')).href);
	}
};
