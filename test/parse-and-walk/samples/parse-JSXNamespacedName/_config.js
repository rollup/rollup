const assert = require('node:assert/strict');

const indexSXNamespacedNames = [];

module.exports = defineTest({
	description: 'parses a JSXNamespacedName',
	parseOptions: { jsx: true },
	walk: {
		JSXNamespacedName(node) {
			indexSXNamespacedNames.push(node);
		}
	},
	assertions() {
		assert.ok(indexSXNamespacedNames.length >= 2);
		assert.strictEqual(indexSXNamespacedNames[0].type, 'JSXNamespacedName');
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 36,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 35,
				declaration: {
					type: 'JSXElement',
					start: 15,
					end: 34,
					openingElement: {
						type: 'JSXOpeningElement',
						start: 15,
						end: 24,
						selfClosing: false,
						name: {
							type: 'JSXNamespacedName',
							start: 16,
							end: 23,
							namespace: {
								type: 'JSXIdentifier',
								start: 16,
								end: 18,
								name: 'ns'
							},
							name: {
								type: 'JSXIdentifier',
								start: 19,
								end: 23,
								name: 'name'
							}
						},
						attributes: []
					},
					children: [],
					closingElement: {
						type: 'JSXClosingElement',
						start: 24,
						end: 34,
						name: {
							type: 'JSXNamespacedName',
							start: 26,
							end: 33,
							namespace: {
								type: 'JSXIdentifier',
								start: 26,
								end: 28,
								name: 'ns'
							},
							name: {
								type: 'JSXIdentifier',
								start: 29,
								end: 33,
								name: 'name'
							}
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
