const assert = require('node:assert/strict');

const unaryExpressions = [];

module.exports = defineTest({
	description: 'parses a UnaryExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						UnaryExpression(node) {
							unaryExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(unaryExpressions.length, 1);
		assert.strictEqual(unaryExpressions[0].type, 'UnaryExpression');
	}
});
