const assert = require('node:assert/strict');

const indexSXMemberExpressions = [];

module.exports = defineTest({
	description: 'parses a JSXMemberExpression',
	parseOptions: { jsx: true },
	walk: {
		JSXMemberExpression(node) {
			indexSXMemberExpressions.push(node);
		}
	},
	assertions() {
		assert.ok(indexSXMemberExpressions.length >= 2);
		assert.strictEqual(indexSXMemberExpressions[0].type, 'JSXMemberExpression');
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
							type: 'JSXMemberExpression',
							start: 16,
							end: 23,
							object: {
								type: 'JSXIdentifier',
								start: 16,
								end: 19,
								name: 'Foo'
							},
							property: {
								type: 'JSXIdentifier',
								start: 20,
								end: 23,
								name: 'Bar'
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
							type: 'JSXMemberExpression',
							start: 26,
							end: 33,
							object: {
								type: 'JSXIdentifier',
								start: 26,
								end: 29,
								name: 'Foo'
							},
							property: {
								type: 'JSXIdentifier',
								start: 30,
								end: 33,
								name: 'Bar'
							}
						}
					}
				}
			}
		],
		sourceType: 'module'
	}
});
