const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'renders a valid CommonJS assignment when a var declaration is the body of a for-of or for-in loop',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.bodyVar, 3);
		assert.equal(exports.bodyIn, 4);
	}
});
