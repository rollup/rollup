var assert = require('assert');

module.exports = {
	description: 'Associates value mutations across return values',
	exports: function(exports) {
		assert.equal(exports.bar, 'present');
	}
};
