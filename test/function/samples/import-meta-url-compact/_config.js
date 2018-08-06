const assert = require('assert');
const path = require('path');
const URL = global.URL || require('url-parse');

module.exports = {
	description: 'import.meta.url support',
	options: { output: { compact: true } },
	context: {
		__filename: path.resolve(__dirname, 'test.js'),
		require: name => {
			assert.equal(name, 'url');
			return { URL };
		}
	},
	exports(exports) {
		assert.equal(exports, new URL('file:' + path.resolve(__dirname, 'test.js')).href);
	}
};
