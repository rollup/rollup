const assert = require('node:assert/strict');

const variableDeclarations = [];

module.exports = defineTest({
	description: 'parses a VariableDeclaration',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						VariableDeclaration(node) {
							variableDeclarations.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.ok(variableDeclarations.length >= 1);
		assert.strictEqual(variableDeclarations[0].type, 'VariableDeclaration');
	}
});
