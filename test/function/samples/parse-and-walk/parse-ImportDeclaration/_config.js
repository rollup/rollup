const assert = require('node:assert/strict');

const importDeclarations = [];

module.exports = defineTest({
	description: 'parses an ImportDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ImportDeclaration(node) {
							importDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(importDeclarations.length, 1);
		assert.strictEqual(importDeclarations[0].type, 'ImportDeclaration');
	}
});
