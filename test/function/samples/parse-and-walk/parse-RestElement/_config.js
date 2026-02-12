const assert = require('node:assert/strict');

const restElements = [];

module.exports = defineTest({
	description: 'parses a RestElement',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						RestElement(node) {
							restElements.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(restElements, [
			{
				type: 'RestElement',
				start: 7,
				end: 14,
				argument: {
					type: 'Identifier',
					start: 10,
					end: 14,
					name: 'rest'
				}
			}
		]);
	}
});
