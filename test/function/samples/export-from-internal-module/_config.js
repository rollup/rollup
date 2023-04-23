const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'exports from an internal module',
	exports(exports) {
		assert.equal(exports.foo, 42);
	}
});
