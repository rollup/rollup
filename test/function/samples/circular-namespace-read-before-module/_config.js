const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'creates namespace objects early if a module in a cycle reads them before their module ran',
	options: { output: { exports: 'named' } },
	warnings(warnings) {
		assert.strictEqual(warnings.length, 1);
		assert.strictEqual(warnings[0].code, 'CIRCULAR_DEPENDENCY');
	}
});
