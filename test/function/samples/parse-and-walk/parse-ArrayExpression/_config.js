const assert = require('node:assert/strict');

const arrayExpressions = [];

module.exports = defineTest({
	description: 'parses an ArrayExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ArrayExpression(node) {
							arrayExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(arrayExpressions, [
			{
				type: 'ArrayExpression',
				start: 15,
				end: 18,
				elements: [{ type: 'Literal', start: 16, end: 17, raw: '1', value: 1 }]
			}
		]);
	}
});
