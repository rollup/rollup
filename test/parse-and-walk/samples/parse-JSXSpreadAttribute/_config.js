const assert = require('node:assert/strict');

const indexSXSpreadAttributes = [];

module.exports = defineTest({
	description: 'parses a JSXSpreadAttribute',
	parseOptions: { jsx: true },
	walk: {
		JSXSpreadAttribute(node) {
			indexSXSpreadAttributes.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXSpreadAttributes.length, 1);
		assert.strictEqual(indexSXSpreadAttributes[0].type, 'JSXSpreadAttribute');
	}
});
