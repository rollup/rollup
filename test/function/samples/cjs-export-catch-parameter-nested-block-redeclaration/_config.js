const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'registers catch-parameter var redeclarations in nested blocks without colliding with chunk bindings',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.catchA, 1);
		assert.equal(exports.y, 'dep');
	}
});
