const assert = require('node:assert');

module.exports = defineTest({
	description: 'Associates getter return values with regard to mutations',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
