const assert = require('assert');

module.exports = {
	description: 'warns if code calls an internal namespace',
	warnings(warnings) {
		assert.deepStrictEqual(warnings.map(String), [
			"main.js (4:1) Cannot call a namespace ('foo')",
			"main.js (8:1) Cannot call a namespace ('foo')"
		]);
	}
};
