const assert = require('node:assert/strict');

const whileStatements = [];

module.exports = defineTest({
	description: 'parses a WhileStatement',
	walk: {
		WhileStatement(node) {
			whileStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(whileStatements.length, 1);
		assert.strictEqual(whileStatements[0].type, 'WhileStatement');
	}
});
