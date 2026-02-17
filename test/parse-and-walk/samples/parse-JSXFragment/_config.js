const assert = require('node:assert/strict');

const indexSXFragments = [];

module.exports = defineTest({
	description: 'parses a JSXFragment',
	parseOptions: { jsx: true },
	walk: {
		JSXFragment(node) {
			indexSXFragments.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXFragments.length, 1);
		assert.strictEqual(indexSXFragments[0].type, 'JSXFragment');
	}
});
