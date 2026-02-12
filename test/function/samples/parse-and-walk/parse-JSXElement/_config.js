const assert = require('node:assert/strict');

const jsxElements = [];

module.exports = defineTest({
	description: 'parses a JSXElement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(
						code,
						{
							JSXElement(node) {
								jsxElements.push(node);
							}
						},
						{ jsx: true }
					);
					return 'export default null;';
				}
			}
		]
	},
	exports() {
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
