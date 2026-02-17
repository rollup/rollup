const assert = require('node:assert/strict');

const variableDeclarations = [];

module.exports = defineTest({
	description: 'parses a VariableDeclaration',
	walk: {
		VariableDeclaration(node) {
			variableDeclarations.push(node);
		}
	},
	assertions() {
		assert.ok(variableDeclarations.length >= 1);
		assert.strictEqual(variableDeclarations[0].type, 'VariableDeclaration');
	}
});
