const assert = require('assert');

module.exports = {
	description: 'errors if code calls an internal namespace',
	warnings(warnings) {
		assert.deepStrictEqual(warnings.map(String), ["main.js (3:2) Cannot call a namespace ('foo')"]);
	},
};
