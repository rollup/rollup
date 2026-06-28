const assert = require('node:assert/strict');

const ifStatements = [];

module.exports = defineTest({
	description: 'parses an IfStatement',
	walk: {
		IfStatement(node) {
			ifStatements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(ifStatements.length, 1);
		assert.strictEqual(ifStatements[0].type, 'IfStatement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 56,
		body: [
			{
				type: 'IfStatement',
				start: 0,
				end: 34,
				test: {
					type: 'Literal',
					start: 4,
					end: 8,
					value: true,
					raw: 'true'
				},
				consequent: {
					type: 'BlockStatement',
					start: 10,
					end: 34,
					body: [
						{
							type: 'ExpressionStatement',
							start: 13,
							end: 32,
							expression: {
								type: 'CallExpression',
								start: 13,
								end: 31,
								optional: false,
								callee: {
									type: 'MemberExpression',
									start: 13,
									end: 24,
									computed: false,
									optional: false,
									object: {
										type: 'Identifier',
										start: 13,
										end: 20,
										name: 'console'
									},
									property: {
										type: 'Identifier',
										start: 21,
										end: 24,
										name: 'log'
									}
								},
								arguments: [
									{
										type: 'Literal',
										start: 25,
										end: 30,
										value: 'yes',
										raw: "'yes'"
									}
								]
							}
						}
					]
				},
				alternate: null
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 35,
				end: 55,
				declaration: {
					type: 'Literal',
					start: 50,
					end: 54,
					raw: 'null',
					value: null
				}
			}
		],
		sourceType: 'module'
	}
});
