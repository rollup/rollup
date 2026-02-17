const assert = require('node:assert/strict');

const tryStatements = [];

module.exports = defineTest({
	description: 'parses a TryStatement',
	walk: {
		TryStatement(node) {
			tryStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(tryStatements.length, 1);
		assert.strictEqual(tryStatements[0].type, 'TryStatement');
	}
});
