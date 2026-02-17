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
	}
});
