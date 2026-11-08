const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'handles mutation and deletion of namespaces exported as default',
	warnings(warnings) {
		assert.deepStrictEqual(warnings.map(({ code }) => code).sort(), [
			'ILLEGAL_REASSIGNMENT',
			'ILLEGAL_REASSIGNMENT',
			'MISSING_EXPORT'
		]);
	}
});
