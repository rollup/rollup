var assert = require('assert');

module.exports = {
	description: 'avoids SyntaxError with default token (#33)',
	exports: function(exports) {
		assert.equal(exports.foo, 42);
		assert.equal(exports.bar, 42);
	}
};
