const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'renders a valid CommonJS for loop when its var initializer is exported',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.index, 2);
	}
});
