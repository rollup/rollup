const assert = require('node:assert/strict');

const thisExpressions = [];

module.exports = defineTest({
	description: 'parses a ThisExpression',
	walk: {
		ThisExpression(node) {
			thisExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(thisExpressions.length, 1);
		assert.strictEqual(thisExpressions[0].type, 'ThisExpression');
	}
});
