var assert = require('assert');

module.exports = {
	description: 'Associates function return values of returned functions',
	exports: function(exports) {
		assert.equal(exports.bar, 'present');
	}
};
