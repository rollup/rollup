const assert = require('node:assert/strict');

const importAttributes = [];

module.exports = defineTest({
	description: 'parses an ImportAttribute',
	walk: {
		ImportAttribute(node) {
			importAttributes.push(node);
		}
	},
	assertions() {
		assert.deepEqual(importAttributes, [
			{
				type: 'ImportAttribute',
				start: 36,
				end: 48,
				key: {
					type: 'Identifier',
					start: 36,
					end: 40,
					name: 'type'
				},
				value: {
					type: 'Literal',
					start: 42,
					end: 48,
					value: 'json',
					raw: "'json'"
				}
			}
		]);
	}
});
