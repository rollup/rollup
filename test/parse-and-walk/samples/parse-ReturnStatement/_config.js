const assert = require('node:assert/strict');

const returnStatements = [];

module.exports = defineTest({
	description: 'parses a ReturnStatement',
	walk: {
		ReturnStatement(node) {
			returnStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(returnStatements.length, 1);
		assert.strictEqual(returnStatements[0].type, 'ReturnStatement');
	}
});
