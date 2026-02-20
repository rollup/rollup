const assert = require('node:assert/strict');

const jsxAttributes = [];

module.exports = defineTest({
	description: 'parses a JSXAttribute',
	parseOptions: { jsx: true },
	walk: {
		JSXAttribute(node) {
			jsxAttributes.push(node);
		}
	},
	assertions() {
		assert.deepEqual(jsxAttributes, [
			{
				type: 'JSXAttribute',
				start: 20,
				end: 29,
				name: { type: 'JSXIdentifier', start: 20, end: 22, name: 'id' },
				value: { type: 'Literal', start: 23, end: 29, value: 'test', raw: '"test"' }
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 38,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 37,
				declaration: {
					type: 'JSXElement',
					start: 15,
					end: 36,
					openingElement: {
						type: 'JSXOpeningElement',
						start: 15,
						end: 30,
						selfClosing: false,
						name: {
							type: 'JSXIdentifier',
							start: 16,
							end: 19,
							name: 'div'
						},
						attributes: [
							{
								type: 'JSXAttribute',
								start: 20,
								end: 29,
								name: {
									type: 'JSXIdentifier',
									start: 20,
									end: 22,
									name: 'id'
								},
								value: {
									type: 'Literal',
									start: 23,
									end: 29,
									value: 'test',
									raw: '"test"'
								}
							}
						]
					},
					children: [],
					closingElement: {
						type: 'JSXClosingElement',
						start: 30,
						end: 36,
						name: {
							type: 'JSXIdentifier',
							start: 32,
							end: 35,
							name: 'div'
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
