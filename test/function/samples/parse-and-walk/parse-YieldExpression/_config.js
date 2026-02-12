const assert = require('node:assert/strict');

const yieldExpressions = [];

module.exports = defineTest({
	description: 'parses a YieldExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						YieldExpression(node) {
							yieldExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(yieldExpressions.length, 1);
		assert.strictEqual(yieldExpressions[0].type, 'YieldExpression');
	}
});
