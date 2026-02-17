const assert = require('node:assert/strict');

const identifiers = [];

module.exports = defineTest({
	description: 'parses an Identifier',
	walk: {
		Identifier(node) {
			identifiers.push(node);
		}
	},
	assertions() {
		assert.deepEqual(identifiers, [
			{
				type: 'Identifier',
				start: 6,
				end: 7,
				name: 'x'
			},
			{
				type: 'Identifier',
				start: 28,
				end: 29,
				name: 'x'
			}
		]);
	}
});
