const assert = require('node:assert/strict');

const indexSXSpreadChilds = [];

module.exports = defineTest({
	description: 'parses a JSXSpreadChild',
	parseOptions: { jsx: true },
	walk: {
		JSXSpreadChild(node) {
			indexSXSpreadChilds.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXSpreadChilds.length, 1);
		assert.strictEqual(indexSXSpreadChilds[0].type, 'JSXSpreadChild');
	}
});
