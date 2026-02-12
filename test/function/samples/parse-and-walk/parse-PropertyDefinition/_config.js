const assert = require('node:assert/strict');

const propertyDefinitions = [];

module.exports = defineTest({
	description: 'parses a PropertyDefinition',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						PropertyDefinition(node) {
							propertyDefinitions.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(propertyDefinitions, [
			{
				type: 'PropertyDefinition',
				start: 24,
				end: 30,
				static: false,
				computed: false,
				decorators: [],
				key: {
					type: 'Identifier',
					start: 24,
					end: 25,
					name: 'x'
				},
				value: {
					type: 'Literal',
					start: 28,
					end: 29,
					raw: '1',
					value: 1
				}
			}
		]);
	}
});
