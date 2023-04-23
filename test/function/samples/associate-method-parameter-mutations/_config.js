const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Associates method parameters with their call arguments with regard to mutations',
	exports(exports) {
		assert.equal(exports.baz, 'present');
	}
});
