const assert = require('node:assert/strict');

const identifiers = [];

module.exports = defineTest({
	description: 'parses an Identifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						Identifier(node) {
							identifiers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
