const assert = require('node:assert/strict');

const indexSXTexts = [];

module.exports = defineTest({
	description: 'parses a JSXText',
	parseOptions: { jsx: true },
	walk: {
		JSXText(node) {
			indexSXTexts.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXTexts.length, 1);
		assert.strictEqual(indexSXTexts[0].type, 'JSXText');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 33,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 32,
				declaration: {
					type: 'JSXElement',
					start: 15,
					end: 31,
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
							type: 'JSXText',
							start: 20,
							end: 25,
							value: 'Hello',
							raw: 'Hello'
						}
					],
					closingElement: {
						type: 'JSXClosingElement',
						start: 25,
						end: 31,
						name: {
							type: 'JSXIdentifier',
							start: 27,
							end: 30,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
