const assert = require('node:assert');

module.exports = defineTest({
	description: 'renames variables named "exports" if necessary',
	exports(exports) {
		assert.deepEqual(Object.keys(exports), ['a', 'b']);
		assert.equal(exports.a, 'A');
		assert.equal(exports.b, 42);
	}
});
