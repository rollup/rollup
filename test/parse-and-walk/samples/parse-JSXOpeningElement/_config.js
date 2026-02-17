const assert = require('node:assert/strict');

const indexSXOpeningElements = [];

module.exports = defineTest({
	description: 'parses a JSXOpeningElement',
	parseOptions: { jsx: true },
	walk: {
		JSXOpeningElement(node) {
			indexSXOpeningElements.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXOpeningElements.length, 1);
		assert.strictEqual(indexSXOpeningElements[0].type, 'JSXOpeningElement');
	}
});
