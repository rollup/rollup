const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'inserts newline after comment',
	exports(exports) {
		assert.equal(exports(), 42);
	}
});
