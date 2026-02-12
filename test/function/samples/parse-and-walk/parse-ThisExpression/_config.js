const assert = require('node:assert/strict');

const thisExpressions = [];

module.exports = defineTest({
	description: 'parses a ThisExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ThisExpression(node) {
							thisExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(thisExpressions.length, 1);
		assert.strictEqual(thisExpressions[0].type, 'ThisExpression');
	}
});
