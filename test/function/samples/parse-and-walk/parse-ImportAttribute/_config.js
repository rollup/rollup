const assert = require('node:assert/strict');

const importAttributes = [];

module.exports = defineTest({
	description: 'parses an ImportAttribute',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code, id) {
					if (id.endsWith('.json')) return null;
					await this.parseAndWalk(code, {
						ImportAttribute(node) {
							importAttributes.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
