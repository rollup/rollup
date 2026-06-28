const assert = require('node:assert/strict');

const forInStatements = [];

module.exports = defineTest({
	description: 'parses a ForInStatement',
	walk: {
		ForInStatement(node) {
			forInStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(forInStatements, [
			{
				type: 'ForInStatement',
				start: 22,
				end: 67,
				left: {
					type: 'VariableDeclaration',
					start: 27,
					end: 36,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 33,
							end: 36,
							id: {
								type: 'Identifier',
								start: 33,
								end: 36,
								name: 'key'
							},
							init: null
						}
					]
				},
				right: {
					type: 'Identifier',
					start: 40,
					end: 43,
					name: 'obj'
				},
				body: {
					type: 'BlockStatement',
					start: 45,
					end: 67,
					body: [
						{
							type: 'ExpressionStatement',
							start: 48,
							end: 65,
							expression: {
								type: 'CallExpression',
								start: 48,
								end: 64,
								optional: false,
								callee: {
									type: 'MemberExpression',
									start: 48,
									end: 59,
									computed: false,
									optional: false,
									object: {
										type: 'Identifier',
										start: 48,
										end: 55,
										name: 'console'
									},
									property: {
										type: 'Identifier',
										start: 56,
										end: 59,
										name: 'log'
									}
								},
								arguments: [
									{
										type: 'Identifier',
										start: 60,
										end: 63,
										name: 'key'
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
		end: 88,
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
							name: 'obj'
						},
						init: {
							type: 'ObjectExpression',
							start: 12,
							end: 20,
							properties: [
								{
									type: 'Property',
									start: 14,
									end: 18,
									method: false,
									shorthand: false,
									computed: false,
									key: {
										type: 'Identifier',
										start: 14,
										end: 15,
										name: 'a'
									},
									value: {
										type: 'Literal',
										start: 17,
										end: 18,
										raw: '1',
										value: 1
									},
									kind: 'init'
								}
							]
						}
					}
				]
			},
			{
				type: 'ForInStatement',
				start: 22,
				end: 67,
				left: {
					type: 'VariableDeclaration',
					start: 27,
					end: 36,
					kind: 'const',
					declarations: [
						{
							type: 'VariableDeclarator',
							start: 33,
							end: 36,
							id: {
								type: 'Identifier',
								start: 33,
								end: 36,
								name: 'key'
							},
							init: null
						}
					]
				},
				right: {
					type: 'Identifier',
					start: 40,
					end: 43,
					name: 'obj'
				},
				body: {
					type: 'BlockStatement',
					start: 45,
					end: 67,
					body: [
						{
							type: 'ExpressionStatement',
							start: 48,
							end: 65,
							expression: {
								type: 'CallExpression',
								start: 48,
								end: 64,
								optional: false,
								callee: {
									type: 'MemberExpression',
									start: 48,
									end: 59,
									computed: false,
									optional: false,
									object: {
										type: 'Identifier',
										start: 48,
										end: 55,
										name: 'console'
									},
									property: {
										type: 'Identifier',
										start: 56,
										end: 59,
										name: 'log'
									}
								},
								arguments: [
									{
										type: 'Identifier',
										start: 60,
										end: 63,
										name: 'key'
									}
								]
							}
						}
					]
				}
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 68,
				end: 87,
				declaration: {
					type: 'Identifier',
					start: 83,
					end: 86,
					name: 'obj'
				}
			}
		],
		sourceType: 'module'
	}
});
