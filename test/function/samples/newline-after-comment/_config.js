const assert = require('assert');

module.exports = {
	description: 'inserts newline after comment',
	exports(exports) {
		assert.equal(exports(), 42);
	}
};
