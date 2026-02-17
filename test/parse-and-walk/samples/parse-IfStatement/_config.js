const assert = require('node:assert/strict');

const ifStatements = [];

module.exports = defineTest({
	description: 'parses an IfStatement',
	walk: {
		IfStatement(node) {
			ifStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(ifStatements.length, 1);
		assert.strictEqual(ifStatements[0].type, 'IfStatement');
	}
});
