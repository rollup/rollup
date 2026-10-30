const assert = require('node:assert/strict');

const indexSXSpreadAttributes = [];

module.exports = defineTest({
	description: 'parses a JSXSpreadAttribute',
	parseOptions: { jsx: true },
	walk: {
		JSXSpreadAttribute(node) {
			indexSXSpreadAttributes.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXSpreadAttributes.length, 1);
		assert.strictEqual(indexSXSpreadAttributes[0].type, 'JSXSpreadAttribute');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 57,
		body: [
			{
				type: 'VariableDeclaration',
				start: 0,
				end: 17,
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						start: 6,
						end: 16,
						id: {
							type: 'Identifier',
							start: 6,
							end: 11,
							name: 'props'
						},
						init: {
							type: 'ObjectExpression',
							start: 14,
							end: 16,
							properties: []
						}
					}
				]
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 18,
				end: 56,
				declaration: {
					type: 'JSXElement',
					start: 33,
					end: 55,
					openingElement: {
						type: 'JSXOpeningElement',
						start: 33,
						end: 49,
						selfClosing: false,
						name: {
							type: 'JSXIdentifier',
							start: 34,
							end: 37,
							name: 'div'
						},
						attributes: [
							{
								type: 'JSXSpreadAttribute',
								start: 38,
								end: 48,
								argument: {
									type: 'Identifier',
									start: 42,
									end: 47,
									name: 'props'
								}
							}
						]
					},
					children: [],
					closingElement: {
						type: 'JSXClosingElement',
						start: 49,
						end: 55,
						name: {
							type: 'JSXIdentifier',
							start: 51,
							end: 54,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
