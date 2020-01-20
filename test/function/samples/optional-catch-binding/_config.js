const assert = require('assert');

module.exports = {
	description: 'allows optional catch binding with appropriate acorn settings',
	exports(exports) {
		assert.equal(exports.foo, true);
	}
};
