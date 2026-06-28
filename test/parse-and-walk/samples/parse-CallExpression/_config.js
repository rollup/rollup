const assert = require('node:assert/strict');

const callExpressions = [];

module.exports = defineTest({
	description: 'parses a CallExpression',
	walk: {
		CallExpression(node) {
			callExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(callExpressions, [
			{
				type: 'CallExpression',
				start: 37,
				end: 43,
				optional: false,
				callee: {
					type: 'Identifier',
					start: 37,
					end: 40,
					name: 'foo'
				},
				arguments: [
					{
						type: 'Literal',
						start: 41,
						end: 42,
						raw: '1',
						value: 1
					}
				]
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 45,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 21,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 20,
						id: {
							type: 'Identifier',
							start: 6,
							end: 9,
							name: 'foo'
						},
						init: {
							type: 'ArrowFunctionExpression',
							start: 12,
							end: 20,
							async: false,
							expression: false,
							generator: false,
							params: [],
							body: {
								type: 'BlockStatement',
								start: 18,
								end: 20,
								body: []
							},
							id: null
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 22,
				end: 44,
				declaration: {
					type: 'CallExpression',
					start: 37,
					end: 43,
					optional: false,
					callee: {
						type: 'Identifier',
						start: 37,
						end: 40,
						name: 'foo'
					},
					arguments: [
						{
							type: 'Literal',
							start: 41,
							end: 42,
							raw: '1',
							value: 1
						}
					]
				}
			}
		],
		sourceType: 'module'
	}
});
