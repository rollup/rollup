const assert = require('node:assert/strict');

const ifStatements = [];

module.exports = defineTest({
	description: 'parses an IfStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						IfStatement(node) {
							ifStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(ifStatements.length, 1);
		assert.strictEqual(ifStatements[0].type, 'IfStatement');
	}
});
