const assert = require('node:assert/strict');

const memberExpressions = [];

module.exports = defineTest({
	description: 'parses a MemberExpression',
	walk: {
		MemberExpression(node) {
			memberExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(memberExpressions, [
			{
				type: 'MemberExpression',
				start: 15,
				end: 26,
				computed: false,
				optional: false,
				object: {
					type: 'Identifier',
					start: 15,
					end: 22,
					name: 'console'
				},
				property: {
					type: 'Identifier',
					start: 23,
					end: 26,
					name: 'log'
				}
			}
		]);
	}
});
