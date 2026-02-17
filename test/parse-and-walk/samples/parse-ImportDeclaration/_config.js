const assert = require('node:assert/strict');

const importDeclarations = [];

module.exports = defineTest({
	description: 'parses an ImportDeclaration',
	walk: {
		ImportDeclaration(node) {
			importDeclarations.push(node);
		}
	},
	assertions() {
		assert.strictEqual(importDeclarations.length, 1);
		assert.strictEqual(importDeclarations[0].type, 'ImportDeclaration');
	}
});
