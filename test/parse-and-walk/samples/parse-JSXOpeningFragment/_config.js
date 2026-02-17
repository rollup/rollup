const assert = require('node:assert/strict');

const indexSXOpeningFragments = [];

module.exports = defineTest({
	description: 'parses a JSXOpeningFragment',
	parseOptions: { jsx: true },
	walk: {
		JSXOpeningFragment(node) {
			indexSXOpeningFragments.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXOpeningFragments.length, 1);
		assert.strictEqual(indexSXOpeningFragments[0].type, 'JSXOpeningFragment');
	}
});
