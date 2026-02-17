const assert = require('node:assert/strict');

const indexSXNamespacedNames = [];

module.exports = defineTest({
	description: 'parses a JSXNamespacedName',
	parseOptions: { jsx: true },
	walk: {
		JSXNamespacedName(node) {
			indexSXNamespacedNames.push(node);
		}
	},
	assertions() {
		assert.ok(indexSXNamespacedNames.length >= 2);
		assert.strictEqual(indexSXNamespacedNames[0].type, 'JSXNamespacedName');
	}
});
