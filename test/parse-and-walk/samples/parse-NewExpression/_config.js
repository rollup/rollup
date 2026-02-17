const assert = require('node:assert/strict');

const newExpressions = [];

module.exports = defineTest({
	description: 'parses a NewExpression',
	walk: {
		NewExpression(node) {
			newExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(newExpressions, [
			{
				type: 'NewExpression',
				start: 15,
				end: 25,
				callee: {
					type: 'Identifier',
					start: 19,
					end: 23,
					name: 'Date'
				},
				arguments: []
			}
		]);
	}
});
