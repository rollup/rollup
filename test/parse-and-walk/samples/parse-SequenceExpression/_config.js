const assert = require('node:assert/strict');

const sequenceExpressions = [];

module.exports = defineTest({
	description: 'parses a SequenceExpression',
	walk: {
		SequenceExpression(node) {
			sequenceExpressions.push(node);
		}
	},
	assertions() {
		assert.strictEqual(sequenceExpressions.length, 1);
		assert.strictEqual(sequenceExpressions[0].type, 'SequenceExpression');
	}
});
