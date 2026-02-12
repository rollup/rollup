const assert = require('node:assert/strict');

const arrowFunctionExpressions = [];

module.exports = defineTest({
	description: 'parses an ArrowFunctionExpression',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ArrowFunctionExpression(node) {
							arrowFunctionExpressions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(arrowFunctionExpressions, [
			{
				type: 'ArrowFunctionExpression',
				start: 15,
				end: 25,
				async: false,
				expression: true,
				generator: false,
				params: [
					{
						type: 'Identifier',
						start: 15,
						end: 16,
						name: 'x'
					}
				],
				body: {
					type: 'BinaryExpression',
					start: 20,
					end: 25,
					operator: '+',
					left: {
						type: 'Identifier',
						start: 20,
						end: 21,
						name: 'x'
					},
					right: {
						type: 'Literal',
						start: 24,
						end: 25,
						raw: '1',
						value: 1
					}
				},
				id: null
			}
		]);
	}
});
