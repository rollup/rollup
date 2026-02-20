const assert = require('node:assert/strict');

const indexSXIdentifiers = [];

module.exports = defineTest({
	description: 'parses a JSXIdentifier',
	parseOptions: { jsx: true },
	walk: {
		JSXIdentifier(node) {
			indexSXIdentifiers.push(node);
		}
	},
	assertions() {
		assert.ok(indexSXIdentifiers.length >= 2);
		assert.strictEqual(indexSXIdentifiers[0].type, 'JSXIdentifier');
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
