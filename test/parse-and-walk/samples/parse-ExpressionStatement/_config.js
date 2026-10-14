const assert = require('node:assert/strict');

const expressionStatements = [];

module.exports = defineTest({
	description: 'parses an ExpressionStatement',
	walk: {
		ExpressionStatement(node) {
			expressionStatements.push(node);
		}
	},
	assertions() {
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
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 28,
		body: [
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
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 7,
				end: 27,
				declaration: {
					type: 'Literal',
					start: 22,
					end: 26,
					raw: 'null',
					value: null
				}
			}
		],
		sourceType: 'module'
	}
});
