const assert = require('node:assert/strict');

const awaitExpressions = [];

module.exports = defineTest({
	description: 'parses an AwaitExpression',
	walk: {
		AwaitExpression(node) {
			awaitExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(awaitExpressions.length, 1);
		assert.strictEqual(awaitExpressions[0].type, 'AwaitExpression');
		assert.strictEqual(awaitExpressions[0].start, 46);
		assert.strictEqual(awaitExpressions[0].end, 70);
	}
});
