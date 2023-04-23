const assert = require('node:assert');

module.exports = defineTest({
	description: 'handle destruction patterns in export declarations',

	exports(exports) {
		assert.deepEqual(Object.keys(exports), ['baz', 'quux']);
		assert.equal(exports.baz, 5);
		assert.equal(exports.quux, 17);
	}
});
