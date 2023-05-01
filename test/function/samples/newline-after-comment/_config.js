const assert = require('node:assert');

module.exports = defineTest({
	description: 'inserts newline after comment',
	exports(exports) {
		assert.equal(exports(), 42);
	}
});
