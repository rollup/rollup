const assert = require('node:assert/strict');

const continueStatements = [];

module.exports = defineTest({
	description: 'parses a ContinueStatement',
	walk: {
		ContinueStatement(node) {
			continueStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(continueStatements, [
			{
				type: 'ContinueStatement',
				start: 32,
				end: 41,
				label: null
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 65,
		body: [
			{
				type: 'ForStatement',
				start: 0,
				end: 43,
				init: {
					type: 'VariableDeclaration',
					start: 5,
					end: 14,
					kind: 'let',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 9,
							end: 14,
							id: {
								type: 'Identifier',
								start: 9,
								end: 10,
								name: 'i'
							},
							init: {
								type: 'Literal',
								start: 13,
								end: 14,
								raw: '0',
								value: 0
							}
						}
					]
				},
				test: {
					type: 'BinaryExpression',
					start: 16,
					end: 22,
					operator: '<',
					left: {
						type: 'Identifier',
						start: 16,
						end: 17,
						name: 'i'
					},
					right: {
						type: 'Literal',
						start: 20,
						end: 22,
						raw: '10',
						value: 10
					}
				},
				update: {
					type: 'UpdateExpression',
					start: 24,
					end: 27,
					prefix: false,
					operator: '++',
					argument: {
						type: 'Identifier',
						start: 24,
						end: 25,
						name: 'i'
					}
				},
				body: {
					type: 'BlockStatement',
					start: 29,
					end: 43,
					body: [
						{
							type: 'ContinueStatement',
							start: 32,
							end: 41,
							label: null
						}
					]
				}
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 44,
				end: 64,
				declaration: {
					type: 'Literal',
					start: 59,
					end: 63,
					raw: 'null',
					value: null
				}
			}
		],
		sourceType: 'module'
	}
});
