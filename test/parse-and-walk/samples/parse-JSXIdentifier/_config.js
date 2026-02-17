const assert = require('node:assert/strict');

const indexSXIdentifiers = [];

module.exports = defineTest({
	description: 'parses a JSXIdentifier',
	parseOptions: { jsx: true },
	walk: {
		JSXIdentifier(node) {
			indexSXIdentifiers.push(node);
		}
	},
	assertions() {
		assert.ok(indexSXIdentifiers.length >= 2);
		assert.strictEqual(indexSXIdentifiers[0].type, 'JSXIdentifier');
	}
});
