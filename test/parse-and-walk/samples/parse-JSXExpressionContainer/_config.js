const assert = require('node:assert/strict');

const indexSXExpressionContainers = [];

module.exports = defineTest({
	description: 'parses a JSXExpressionContainer',
	parseOptions: { jsx: true },
	walk: {
		JSXExpressionContainer(node) {
			indexSXExpressionContainers.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXExpressionContainers.length, 1);
		assert.strictEqual(indexSXExpressionContainers[0].type, 'JSXExpressionContainer');
	}
});
