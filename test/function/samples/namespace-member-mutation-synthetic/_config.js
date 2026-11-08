const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'handles assignments to synthetic namespace members',
	options: {
		plugins: [
			{
				name: 'synthetic-named-exports',
				transform(code, id) {
					if (id.endsWith('dep.js')) return { syntheticNamedExports: true };
				}
			}
		]
	},
	warnings(warnings) {
		assert.strictEqual(warnings.length, 1);
		assert.strictEqual(warnings[0].code, 'ILLEGAL_REASSIGNMENT');
	}
});
