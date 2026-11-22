const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'creates namespace objects early if they can be read through an earlier namespace object',
	options: { output: { exports: 'named' } },
	warnings(warnings) {
		assert.strictEqual(warnings.length, 1);
		assert.strictEqual(warnings[0].code, 'CIRCULAR_DEPENDENCY');
	}
});
