const assert = require('node:assert');

module.exports = defineTest({
	description: 'Associates ES5 constructor parameters with their call arguments',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
