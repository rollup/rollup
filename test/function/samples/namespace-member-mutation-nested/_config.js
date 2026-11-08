const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'handles mutation and deletion of nested namespace members',
	warnings(warnings) {
		assert.strictEqual(warnings.length, 2);
		for (const warning of warnings) {
			assert.strictEqual(warning.code, 'ILLEGAL_REASSIGNMENT');
			assert.ok(warning.message.includes('"ns.inner"'));
		}
	}
});
