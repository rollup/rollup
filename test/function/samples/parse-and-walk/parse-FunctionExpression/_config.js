const assert = require('node:assert/strict');

const functionExpressions = [];

module.exports = defineTest({
	description: 'parses a FunctionExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						FunctionExpression(node) {
							functionExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
