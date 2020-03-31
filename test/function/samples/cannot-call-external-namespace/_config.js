const assert = require('assert');

module.exports = {
	description: 'warns if code calls an external namespace',
	options: {
		external: ['fs'],
	},
	warnings(warnings) {
		assert.deepStrictEqual(warnings.map(String), ["main.js (3:2) Cannot call a namespace ('foo')"]);
	},
};
