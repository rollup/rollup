const assert = require('assert');

module.exports = {
	description: 'Associates ES5 constructor parameters with their call arguments',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
};
