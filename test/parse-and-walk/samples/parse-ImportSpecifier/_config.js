const assert = require('node:assert/strict');

const importSpecifiers = [];

module.exports = defineTest({
	description: 'parses an ImportSpecifier',
	walk: {
		ImportSpecifier(node) {
			importSpecifiers.push(node);
		}
	},
	assertions() {
		assert.deepEqual(importSpecifiers, [
			{
				type: 'ImportSpecifier',
				start: 9,
				end: 12,
				imported: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				},
				local: {
					type: 'Identifier',
					start: 9,
					end: 12,
					name: 'foo'
				}
			}
		]);
	}
});
