const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'does not declare a catch parameter as a chunk binding when it shadows a reassigned export',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.a, 'changed');
	}
});
