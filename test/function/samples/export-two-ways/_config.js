const assert = require('node:assert');

module.exports = defineTest({
	description: 'exports the same binding more than one way',
	exports(exports) {
		assert.equal(exports.a, 2);
		assert.equal(exports.b, 2);
		assert.equal(exports.c, 2);
	}
});
