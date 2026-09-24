const assert = require('node:assert/strict');

const whileStatements = [];

module.exports = defineTest({
	description: 'parses a WhileStatement',
	walk: {
		WhileStatement(node) {
			whileStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(whileStatements.length, 1);
		assert.strictEqual(whileStatements[0].type, 'WhileStatement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 53,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 10,
				kind: 'let',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 4,
						end: 9,
						id: {
							type: 'Identifier',
							start: 4,
							end: 5,
							name: 'x'
						},
						init: {
							type: 'Literal',
							start: 8,
							end: 9,
							raw: '0',
							value: 0
						}
					}
				]
			},
			{
				type: 'WhileStatement',
				start: 11,
				end: 34,
				test: {
					type: 'BinaryExpression',
					start: 18,
					end: 23,
					operator: '<',
					left: {
						type: 'Identifier',
						start: 18,
						end: 19,
						name: 'x'
					},
					right: {
						type: 'Literal',
						start: 22,
						end: 23,
						raw: '1',
						value: 1
					}
				},
				body: {
					type: 'BlockStatement',
					start: 25,
					end: 34,
					body: [
						{
							type: 'ExpressionStatement',
							start: 28,
							end: 32,
							expression: {
								type: 'UpdateExpression',
								start: 28,
								end: 31,
								prefix: false,
								operator: '++',
								argument: {
									type: 'Identifier',
									start: 28,
									end: 29,
									name: 'x'
								}
							}
						}
					]
				}
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 35,
				end: 52,
				declaration: {
					type: 'Identifier',
					start: 50,
					end: 51,
					name: 'x'
				}
			}
		],
		sourceType: 'module'
	}
});
