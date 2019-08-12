const assert = require('assert');

module.exports = {
	description: 'handle destruction patterns in export declarations',
	buble: true,

	exports(exports) {
		assert.deepEqual(Object.keys(exports), ['baz', 'quux']);
		assert.equal(exports.baz, 5);
		assert.equal(exports.quux, 17);
	}
};
