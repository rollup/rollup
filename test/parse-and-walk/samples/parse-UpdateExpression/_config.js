const assert = require('node:assert/strict');

const updateExpressions = [];

module.exports = defineTest({
	description: 'parses an UpdateExpression',
	walk: {
		UpdateExpression(node) {
			updateExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(updateExpressions.length, 1);
		assert.strictEqual(updateExpressions[0].type, 'UpdateExpression');
	}
});
