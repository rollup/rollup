const assert = require('node:assert/strict');

const variableDeclarators = [];

module.exports = defineTest({
	description: 'parses a VariableDeclarator',
	walk: {
		VariableDeclarator(node) {
			variableDeclarators.push(node);
		}
	},
	assertions() {
		assert.ok(variableDeclarators.length >= 1);
		assert.strictEqual(variableDeclarators[0].type, 'VariableDeclarator');
	}
});
