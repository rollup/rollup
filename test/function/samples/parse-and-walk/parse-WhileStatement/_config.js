const assert = require('node:assert/strict');

const whileStatements = [];

module.exports = defineTest({
	description: 'parses a WhileStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						WhileStatement(node) {
							whileStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(whileStatements.length, 1);
		assert.strictEqual(whileStatements[0].type, 'WhileStatement');
	}
});
