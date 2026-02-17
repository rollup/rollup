const assert = require('node:assert/strict');

const unaryExpressions = [];

module.exports = defineTest({
	description: 'parses a UnaryExpression',
	walk: {
		UnaryExpression(node) {
			unaryExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(unaryExpressions.length, 1);
		assert.strictEqual(unaryExpressions[0].type, 'UnaryExpression');
	}
});
