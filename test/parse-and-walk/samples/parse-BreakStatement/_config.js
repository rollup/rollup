const assert = require('node:assert/strict');

const breakStatements = [];

module.exports = defineTest({
	description: 'parses a BreakStatement',
	walk: {
		BreakStatement(node) {
			breakStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(breakStatements.length, 1);
		assert.strictEqual(breakStatements[0].type, 'BreakStatement');
	}
});
