const assert = require('node:assert/strict');

const functionExpressions = [];

module.exports = defineTest({
	description: 'parses a FunctionExpression',
	walk: {
		FunctionExpression(node) {
			functionExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(functionExpressions, [
			{
				type: 'FunctionExpression',
				start: 16,
				end: 30,
				async: false,
				generator: false,
				id: null,
				params: [],
				body: {
					type: 'BlockStatement',
					start: 28,
					end: 30,
					body: []
				},
				expression: false
			}
		]);
	}
});
