const assert = require('node:assert/strict');

const jsxElements = [];

module.exports = defineTest({
	description: 'parses a JSXElement',
	parseOptions: { jsx: true },
	walk: {
		JSXElement(node) {
			jsxElements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(jsxElements, [
			{
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
		]);
	}
});
