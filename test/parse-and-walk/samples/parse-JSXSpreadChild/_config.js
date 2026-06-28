const assert = require('node:assert/strict');

const indexSXSpreadChilds = [];

module.exports = defineTest({
	description: 'parses a JSXSpreadChild',
	parseOptions: { jsx: true },
	walk: {
		JSXSpreadChild(node) {
			indexSXSpreadChilds.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXSpreadChilds.length, 1);
		assert.strictEqual(indexSXSpreadChilds[0].type, 'JSXSpreadChild');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 62,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 20,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 19,
						id: {
							type: 'Identifier',
							start: 6,
							end: 14,
							name: 'children'
						},
						init: {
							type: 'ArrayExpression',
							start: 17,
							end: 19,
							elements: []
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 21,
				end: 61,
				declaration: {
					type: 'JSXElement',
					start: 36,
					end: 60,
					openingElement: {
						type: 'JSXOpeningElement',
						start: 36,
						end: 41,
						selfClosing: false,
						name: {
							type: 'JSXIdentifier',
							start: 37,
							end: 40,
							name: 'div'
						},
						attributes: []
					},
					children: [
						{
							type: 'JSXSpreadChild',
							start: 41,
							end: 54,
							expression: {
								type: 'Identifier',
								start: 45,
								end: 53,
								name: 'children'
							}
						}
					],
					closingElement: {
						type: 'JSXClosingElement',
						start: 54,
						end: 60,
						name: {
							type: 'JSXIdentifier',
							start: 56,
							end: 59,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
