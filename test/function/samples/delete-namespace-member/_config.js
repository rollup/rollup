const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'preserves namespace property references when deleting exports',
	warnings(warnings) {
		assert.ok(warnings.length > 0);
		assert.ok(
			warnings.every(
				warning => warning.code === 'ILLEGAL_REASSIGNMENT' || warning.code === 'MISSING_EXPORT'
			)
		);
	}
});
