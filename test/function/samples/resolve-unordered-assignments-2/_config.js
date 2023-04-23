const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'Assignments should be correctly bound independent of their order',
	exports(exports) {
		assert.equal(exports.baz, 'present');
	}
});
