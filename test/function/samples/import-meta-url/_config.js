const path = require('path');
const assert = require('assert');
const URL = require('url').URL;

module.exports = {
	description: 'resolves import.meta.url',
	context: {
		__filename: path.join(__dirname, 'main.js')
	},
	exports(exports) {
		assert.strictEqual(exports, new URL('file:' + path.join(__dirname, 'main.js')).href);
	}
};
