const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'respects output.freeze false for namespace mutation targets',
	options: {
		output: { freeze: false }
	},
	code(code) {
		assert.ok(!code.includes('Object.freeze'));
	},
	warnings(warnings) {
		assert.strictEqual(warnings.length, 2);
		for (const warning of warnings) {
			assert.strictEqual(warning.code, 'ILLEGAL_REASSIGNMENT');
		}
	}
});
