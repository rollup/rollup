const assert = require('node:assert/strict');

const indexSXEmptyExpressions = [];

module.exports = defineTest({
	description: 'parses a JSXEmptyExpression',
	parseOptions: { jsx: true },
	walk: {
		JSXEmptyExpression(node) {
			indexSXEmptyExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXEmptyExpressions.length, 1);
		assert.strictEqual(indexSXEmptyExpressions[0].type, 'JSXEmptyExpression');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 30,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 29,
				declaration: {
					type: 'JSXElement',
					start: 15,
					end: 28,
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
							end: 22,
							expression: {
								type: 'JSXEmptyExpression',
								start: 21,
								end: 21
							}
						}
					],
					closingElement: {
						type: 'JSXClosingElement',
						start: 22,
						end: 28,
						name: {
							type: 'JSXIdentifier',
							start: 24,
							end: 27,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
