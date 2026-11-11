const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'renders a for-of or for-in var head as an assignment to the exported CommonJS binding',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.current, 1);
		assert.equal(exports.inKey, 'a');
	}
});
