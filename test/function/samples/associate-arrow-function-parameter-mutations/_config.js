const assert = require('node:assert');

module.exports = defineTest({
	description:
		'Associates arrow function parameters with their call arguments with regard to mutations',
	exports(exports) {
		assert.equal(exports.baz, 'present');
	}
});
