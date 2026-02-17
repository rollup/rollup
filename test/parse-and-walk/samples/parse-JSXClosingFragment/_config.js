const assert = require('node:assert/strict');

const indexSXClosingFragments = [];

module.exports = defineTest({
	description: 'parses a JSXClosingFragment',
	parseOptions: { jsx: true },
	walk: {
		JSXClosingFragment(node) {
			indexSXClosingFragments.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXClosingFragments.length, 1);
		assert.strictEqual(indexSXClosingFragments[0].type, 'JSXClosingFragment');
	}
});
