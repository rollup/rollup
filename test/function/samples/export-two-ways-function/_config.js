var assert = require('assert');

module.exports = {
	description: 'exports the same function more than one way (#648)',
	exports: function(exports) {
		assert.equal(exports.foo, exports.bar);
		assert.equal(exports.foo(), 42);
	}
};
