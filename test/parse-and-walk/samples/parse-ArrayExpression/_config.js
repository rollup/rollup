const assert = require('node:assert/strict');

const arrayExpressions = [];

module.exports = defineTest({
	description: 'parses an ArrayExpression',
	walk: {
		ArrayExpression(node) {
			arrayExpressions.push(node);
		}
	},
	assertions() {
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
