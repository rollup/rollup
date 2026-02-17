const assert = require('node:assert/strict');

const classExpressions = [];

module.exports = defineTest({
	description: 'parses a ClassExpression',
	walk: {
		ClassExpression(node) {
			classExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(classExpressions, [
			{
				type: 'ClassExpression',
				start: 16,
				end: 24,
				decorators: [],
				id: null,
				superClass: null,
				body: {
					type: 'ClassBody',
					start: 22,
					end: 24,
					body: []
				}
			}
		]);
	}
});
