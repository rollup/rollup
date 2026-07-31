const assert = require('node:assert/strict');

const forOfStatements = [];

module.exports = defineTest({
	description: 'parses a ForOfStatement',
	walk: {
		ForOfStatement(node) {
			forOfStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(forOfStatements, [
			{
				type: 'ForOfStatement',
				start: 17,
				end: 62,
				await: false,
				left: {
					type: 'VariableDeclaration',
					start: 22,
					end: 31,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 28,
							end: 31,
							id: {
								type: 'Identifier',
								start: 28,
								end: 31,
								name: 'val'
							},
							init: null
						}
					]
				},
				right: {
					type: 'Identifier',
					start: 35,
					end: 38,
					name: 'arr'
				},
				body: {
					type: 'BlockStatement',
					start: 40,
					end: 62,
					body: [
						{
							type: 'ExpressionStatement',
							start: 43,
							end: 60,
							expression: {
								type: 'CallExpression',
								start: 43,
								end: 59,
								optional: false,
								callee: {
									type: 'MemberExpression',
									start: 43,
									end: 54,
									computed: false,
									optional: false,
									object: {
										type: 'Identifier',
										start: 43,
										end: 50,
										name: 'console'
									},
									property: {
										type: 'Identifier',
										start: 51,
										end: 54,
										name: 'log'
									}
								},
								arguments: [
									{
										type: 'Identifier',
										start: 55,
										end: 58,
										name: 'val'
									}
								]
							}
						}
					]
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 83,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 16,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 15,
						id: {
							type: 'Identifier',
							start: 6,
							end: 9,
							name: 'arr'
						},
						init: {
							type: 'ArrayExpression',
							start: 12,
							end: 15,
							elements: [
								{
									type: 'Literal',
									start: 13,
									end: 14,
									raw: '1',
									value: 1
								}
							]
						}
					}
				]
			},
			{
				type: 'ForOfStatement',
				start: 17,
				end: 62,
				await: false,
				left: {
					type: 'VariableDeclaration',
					start: 22,
					end: 31,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 28,
							end: 31,
							id: {
								type: 'Identifier',
								start: 28,
								end: 31,
								name: 'val'
							},
							init: null
						}
					]
				},
				right: {
					type: 'Identifier',
					start: 35,
					end: 38,
					name: 'arr'
				},
				body: {
					type: 'BlockStatement',
					start: 40,
					end: 62,
					body: [
						{
							type: 'ExpressionStatement',
							start: 43,
							end: 60,
							expression: {
								type: 'CallExpression',
								start: 43,
								end: 59,
								optional: false,
								callee: {
									type: 'MemberExpression',
									start: 43,
									end: 54,
									computed: false,
									optional: false,
									object: {
										type: 'Identifier',
										start: 43,
										end: 50,
										name: 'console'
									},
									property: {
										type: 'Identifier',
										start: 51,
										end: 54,
										name: 'log'
									}
								},
								arguments: [
									{
										type: 'Identifier',
										start: 55,
										end: 58,
										name: 'val'
									}
								]
							}
						}
					]
				}
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 63,
				end: 82,
				declaration: {
					type: 'Identifier',
					start: 78,
					end: 81,
					name: 'arr'
				}
			}
		],
		sourceType: 'module'
	}
});
