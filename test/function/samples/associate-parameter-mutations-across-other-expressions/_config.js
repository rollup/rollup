var assert = require('assert');

module.exports = {
	description: 'Associates parameters with their call arguments across other expressions',
	exports: function(exports) {
		assert.equal(exports.bar, 'present');
	}
};
