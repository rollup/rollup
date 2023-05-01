const assert = require('node:assert');
const path = require('node:path');
const URL = require('node:url').URL;

module.exports = defineTest({
	description: 'resolves import.meta.url',
	context: {
		__filename: path.join(__dirname, 'main.js')
	},
	exports(exports) {
		assert.strictEqual(exports, new URL('file:' + path.join(__dirname, 'main.js')).href);
	}
});
