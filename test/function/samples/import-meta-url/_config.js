const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'resolves import.meta.url',
	context: {
		__filename: path.resolve(__dirname, 'main.js')
	},
	exports(exports) {
		assert.strictEqual(exports, 'file://' + path.resolve(__dirname, 'main.js'));
	}
};
