const assert = require('node:assert/strict');

const indexSXEmptyExpressions = [];

module.exports = defineTest({
	description: 'parses a JSXEmptyExpression',
	parseOptions: { jsx: true },
	walk: {
		JSXEmptyExpression(node) {
			indexSXEmptyExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(indexSXEmptyExpressions.length, 1);
		assert.strictEqual(indexSXEmptyExpressions[0].type, 'JSXEmptyExpression');
	}
});
