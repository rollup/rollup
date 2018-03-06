var assert = require('assert');

module.exports = {
	description: 'Associates object expression member parameters with their call arguments',
	exports: function(exports) {
		assert.equal(exports.bar, 'present');
	}
};
