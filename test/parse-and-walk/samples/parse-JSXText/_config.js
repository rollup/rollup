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
	}
});
