var assert = require('assert');

module.exports = {
	description: 'any global variables in scope can be re-exported',

	exports: function(exports) {
		assert.equal(exports.Buffer, Buffer);
	}
};
