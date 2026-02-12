const assert = require('node:assert/strict');

const returnStatements = [];

module.exports = defineTest({
	description: 'parses a ReturnStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ReturnStatement(node) {
							returnStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(returnStatements.length, 1);
		assert.strictEqual(returnStatements[0].type, 'ReturnStatement');
	}
});
