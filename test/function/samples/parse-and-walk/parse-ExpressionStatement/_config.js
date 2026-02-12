const assert = require('node:assert/strict');

const expressionStatements = [];

module.exports = defineTest({
	description: 'parses an ExpressionStatement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ExpressionStatement(node) {
							expressionStatements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(expressionStatements, [
			{
				type: 'ExpressionStatement',
				start: 0,
				end: 6,
				expression: {
					type: 'BinaryExpression',
					start: 0,
					end: 5,
					operator: '+',
					left: {
						type: 'Literal',
						start: 0,
						end: 1,
						raw: '1',
						value: 1
					},
					right: {
						type: 'Literal',
						start: 4,
						end: 5,
						raw: '1',
						value: 1
					}
				}
			}
		]);
	}
});
