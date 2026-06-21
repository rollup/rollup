const assert = require('node:assert/strict');

const indexSXClosingElements = [];

module.exports = defineTest({
	description: 'parses a JSXClosingElement',
	parseOptions: { jsx: true },
	walk: {
		JSXClosingElement(node) {
			indexSXClosingElements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXClosingElements.length, 1);
		assert.strictEqual(indexSXClosingElements[0].type, 'JSXClosingElement');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 28,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 27,
				declaration: {
					type: 'JSXElement',
					start: 15,
					end: 26,
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
					children: [],
					closingElement: {
						type: 'JSXClosingElement',
						start: 20,
						end: 26,
						name: {
							type: 'JSXIdentifier',
							start: 22,
							end: 25,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
