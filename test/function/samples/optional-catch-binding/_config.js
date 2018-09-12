const assert = require('assert');

module.exports = {
	description: 'allows optional catch binding with appropriate acorn settings',
	minNodeVersion: 10,
	options: {
		acorn: {
			ecmaVersion: 2019
		}
	},
	exports(exports) {
		assert.equal(exports.foo, true);
	}
};
