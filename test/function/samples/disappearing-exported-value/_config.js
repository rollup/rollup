var assert = require('assert');

module.exports = {
	description: 'exported values do not mysteriously disappear (#484)',
	exports: function(exports) {
		assert.equal(exports.exportedAnswer, 42);
		assert.equal(exports.foo(), 42);
	}
};
