const assert = require('node:assert/strict');

const variableDeclarators = [];

module.exports = defineTest({
	description: 'parses a VariableDeclarator',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						VariableDeclarator(node) {
							variableDeclarators.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.ok(variableDeclarators.length >= 1);
		assert.strictEqual(variableDeclarators[0].type, 'VariableDeclarator');
	}
});
