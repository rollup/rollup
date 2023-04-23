const assert = require('node:assert');

module.exports = defineTest({
	description: 'Associates parameters with their call arguments across other expressions',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
