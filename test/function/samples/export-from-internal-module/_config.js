const assert = require('node:assert');

module.exports = {
	description: 'exports from an internal module',
	exports(exports) {
		assert.equal(exports.foo, 42);
	}
};
