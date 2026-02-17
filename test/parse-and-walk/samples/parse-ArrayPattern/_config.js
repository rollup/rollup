const assert = require('node:assert/strict');

const arrayPatterns = [];

module.exports = defineTest({
	description: 'parses an ArrayPattern',
	walk: {
		ArrayPattern(node) {
			arrayPatterns.push(node);
		}
	},
	assertions() {
		assert.deepEqual(arrayPatterns, [
			{
				type: 'ArrayPattern',
				start: 13,
				end: 16,
				elements: [{ type: 'Identifier', start: 14, end: 15, name: 'a' }]
			}
		]);
	}
});
