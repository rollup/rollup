const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Associates parameters with their call arguments across other expressions',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
