const assert = require('node:assert/strict');

const indexSXMemberExpressions = [];

module.exports = defineTest({
	description: 'parses a JSXMemberExpression',
	parseOptions: { jsx: true },
	walk: {
		JSXMemberExpression(node) {
			indexSXMemberExpressions.push(node);
		}
	},
	assertions() {
		assert.ok(indexSXMemberExpressions.length >= 2);
		assert.strictEqual(indexSXMemberExpressions[0].type, 'JSXMemberExpression');
	}
});
