const assert = require('assert');

module.exports = {
	description: 'allows optional catch binding with appropriate acorn settings',
	minNodeVersion: 10,
	exports(exports) {
		assert.equal(exports.foo, true);
	}
};
