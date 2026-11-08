const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'throws for assignments to namespace members and keeps the namespace object intact',
	warnings(warnings) {
		assert.strictEqual(warnings.length, 19);
		for (const warning of warnings) {
			assert.strictEqual(warning.code, 'ILLEGAL_REASSIGNMENT');
		}
	}
});
