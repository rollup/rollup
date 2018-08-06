const assert = require('assert');

module.exports = {
	description: 'Associates function parameters with their call arguments with regard to mutations',
	exports(exports) {
		assert.equal(exports.baz, 'present');
	}
};
