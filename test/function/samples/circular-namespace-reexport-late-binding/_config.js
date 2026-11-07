const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'defers namespace reads of bindings initialized in later modules',
	options: { output: { exports: 'named' } },
	warnings(warnings) {
		assert.strictEqual(warnings.length, 1);
		assert.strictEqual(warnings[0].code, 'CIRCULAR_DEPENDENCY');
	}
});
