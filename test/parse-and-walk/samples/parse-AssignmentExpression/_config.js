const assert = require('node:assert/strict');

const assignmentExpressions = [];

module.exports = defineTest({
	description: 'parses an AssignmentExpression',
	walk: {
		AssignmentExpression(node) {
			assignmentExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(assignmentExpressions, [
			{
				type: 'AssignmentExpression',
				start: 22,
				end: 27,
				operator: '=',
				left: { type: 'Identifier', start: 22, end: 23, name: 'x' },
				right: { type: 'Literal', start: 26, end: 27, raw: '1', value: 1 }
			}
		]);
	}
});
