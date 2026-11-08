const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'throws for deleting existing namespace members but allows deleting missing members',
	warnings(warnings) {
		assert.deepStrictEqual(warnings.map(({ code }) => code).sort(), [
			'ILLEGAL_REASSIGNMENT',
			'ILLEGAL_REASSIGNMENT',
			'ILLEGAL_REASSIGNMENT',
			'ILLEGAL_REASSIGNMENT',
			'ILLEGAL_REASSIGNMENT',
			'MISSING_EXPORT',
			'MISSING_EXPORT',
			'MISSING_EXPORT'
		]);
	}
});
