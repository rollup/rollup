const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows optional catch binding',
	exports(exports) {
		assert.equal(exports.foo, true);
	}
});
