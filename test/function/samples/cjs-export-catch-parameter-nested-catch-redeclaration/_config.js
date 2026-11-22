const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'registers var redeclarations in a nested catch body against the outer catch parameter',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.a, 1);
		assert.equal(exports.y, 'dep');
	}
});
