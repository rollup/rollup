const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows destructuring in exported variable declarations, synthetic or otherwise',
	exports(exports) {
		assert.equal(exports.a, 1);
		assert.equal(exports.d, 4);
	}
});
