const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'does not assign catch parameters that shadow a reassigned export',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.caught, 'changed');
	}
});
