const assert = require('node:assert/strict');

const yieldExpressions = [];

module.exports = defineTest({
	description: 'parses a YieldExpression',
	walk: {
		YieldExpression(node) {
			yieldExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(yieldExpressions.length, 1);
		assert.strictEqual(yieldExpressions[0].type, 'YieldExpression');
	}
});
