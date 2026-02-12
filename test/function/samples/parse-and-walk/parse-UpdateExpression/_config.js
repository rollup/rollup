const assert = require('node:assert/strict');

const updateExpressions = [];

module.exports = defineTest({
	description: 'parses an UpdateExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						UpdateExpression(node) {
							updateExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.strictEqual(updateExpressions.length, 1);
		assert.strictEqual(updateExpressions[0].type, 'UpdateExpression');
	}
});
