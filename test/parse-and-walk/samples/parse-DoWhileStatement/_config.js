const assert = require('node:assert/strict');

const doWhileStatements = [];

module.exports = defineTest({
	description: 'parses a DoWhileStatement',
	walk: {
		DoWhileStatement(node) {
			doWhileStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(doWhileStatements, [
			{
				type: 'DoWhileStatement',
				start: 11,
				end: 38,
				body: {
					type: 'BlockStatement',
					start: 14,
					end: 23,
					body: [
						{
							type: 'ExpressionStatement',
							start: 17,
							end: 21,
							expression: {
								type: 'UpdateExpression',
								start: 17,
								end: 20,
								prefix: false,
								operator: '++',
								argument: {
									type: 'Identifier',
									start: 17,
									end: 18,
									name: 'x'
								}
							}
						}
					]
				},
				test: {
					type: 'BinaryExpression',
					start: 31,
					end: 36,
					operator: '<',
					left: {
						type: 'Identifier',
						start: 31,
						end: 32,
						name: 'x'
					},
					right: {
						type: 'Literal',
						start: 35,
						end: 36,
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
		end: 57,
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
				type: 'DoWhileStatement',
				start: 11,
				end: 38,
				body: {
					type: 'BlockStatement',
					start: 14,
					end: 23,
					body: [
						{
							type: 'ExpressionStatement',
							start: 17,
							end: 21,
							expression: {
								type: 'UpdateExpression',
								start: 17,
								end: 20,
								prefix: false,
								operator: '++',
								argument: {
									type: 'Identifier',
									start: 17,
									end: 18,
									name: 'x'
								}
							}
						}
					]
				},
				test: {
					type: 'BinaryExpression',
					start: 31,
					end: 36,
					operator: '<',
					left: {
						type: 'Identifier',
						start: 31,
						end: 32,
						name: 'x'
					},
					right: {
						type: 'Literal',
						start: 35,
						end: 36,
						raw: '1',
						value: 1
					}
				}
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 39,
				end: 56,
				declaration: {
					type: 'Identifier',
					start: 54,
					end: 55,
					name: 'x'
				}
			}
		],
		sourceType: 'module'
	}
});
