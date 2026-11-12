const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'renders valid CommonJS assignments for exported var declarations in loop bodies and heads',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.bodyVar, 3);
		assert.equal(exports.bodyIn, 4);
		assert.equal(exports.current, 1);
		assert.equal(exports.inKey, 'a');
		assert.equal(exports.index, 2);
	}
});
