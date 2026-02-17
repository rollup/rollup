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
	}
});
