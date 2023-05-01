const assert = require('node:assert');

module.exports = defineTest({
	description: 'exports the same function more than one way (#648)',
	exports(exports) {
		assert.equal(exports.foo, exports.bar);
		assert.equal(exports.foo(), 42);
	}
});
