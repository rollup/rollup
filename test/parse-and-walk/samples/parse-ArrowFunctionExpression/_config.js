const assert = require('node:assert/strict');

const arrowFunctionExpressions = [];

module.exports = defineTest({
	description: 'parses an ArrowFunctionExpression',
	walk: {
		ArrowFunctionExpression(node) {
			arrowFunctionExpressions.push(node);
		}
	},
	assertions() {
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
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 27,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 26,
				declaration: {
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
			}
		],
		sourceType: 'module'
	}
});
