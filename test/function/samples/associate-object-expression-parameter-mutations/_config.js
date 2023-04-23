const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Associates object expression member parameters with their call arguments',
	exports(exports) {
		assert.equal(exports.bar, 'present');
	}
});
