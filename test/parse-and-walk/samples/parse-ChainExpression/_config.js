const assert = require('node:assert/strict');

const chainExpressions = [];

module.exports = defineTest({
	description: 'parses a ChainExpression',
	walk: {
		ChainExpression(node) {
			chainExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(chainExpressions, [
			{
				type: 'ChainExpression',
				start: 31,
				end: 40,
				expression: {
					type: 'MemberExpression',
					start: 31,
					end: 40,
					computed: false,
					optional: true,
					object: {
						type: 'Identifier',
						start: 31,
						end: 34,
						name: 'obj'
					},
					property: {
						type: 'Identifier',
						start: 36,
						end: 40,
						name: 'prop'
					}
				}
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 42,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 15,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 14,
						id: {
							type: 'Identifier',
							start: 6,
							end: 9,
							name: 'obj'
						},
						init: {
							type: 'ObjectExpression',
							start: 12,
							end: 14,
							properties: []
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 16,
				end: 41,
				declaration: {
					type: 'ChainExpression',
					start: 31,
					end: 40,
					expression: {
						type: 'MemberExpression',
						start: 31,
						end: 40,
						computed: false,
						optional: true,
						object: {
							type: 'Identifier',
							start: 31,
							end: 34,
							name: 'obj'
						},
						property: {
							type: 'Identifier',
							start: 36,
							end: 40,
							name: 'prop'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
