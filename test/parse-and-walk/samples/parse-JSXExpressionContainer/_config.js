const assert = require('node:assert/strict');

const indexSXExpressionContainers = [];

module.exports = defineTest({
	description: 'parses a JSXExpressionContainer',
	parseOptions: { jsx: true },
	walk: {
		JSXExpressionContainer(node) {
			indexSXExpressionContainers.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXExpressionContainers.length, 1);
		assert.strictEqual(indexSXExpressionContainers[0].type, 'JSXExpressionContainer');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 31,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 30,
				declaration: {
					type: 'JSXElement',
					start: 15,
					end: 29,
					openingElement: {
						type: 'JSXOpeningElement',
						start: 15,
						end: 20,
						selfClosing: false,
						name: {
							type: 'JSXIdentifier',
							start: 16,
							end: 19,
							name: 'div'
						},
						attributes: []
					},
					children: [
						{
							type: 'JSXExpressionContainer',
							start: 20,
							end: 23,
							expression: {
								type: 'Literal',
								start: 21,
								end: 22,
								raw: '1',
								value: 1
							}
						}
					],
					closingElement: {
						type: 'JSXClosingElement',
						start: 23,
						end: 29,
						name: {
							type: 'JSXIdentifier',
							start: 25,
							end: 28,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
