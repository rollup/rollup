const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Associates function parameters with their call arguments with regard to mutations',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
