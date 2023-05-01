const assert = require('node:assert');

module.exports = defineTest({
	description: 'removes empty exported var declarations',
	exports(exports) {
		assert.equal(exports.foo, 42);
	}
});
