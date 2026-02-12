const assert = require('node:assert/strict');

const arrayPatterns = [];

module.exports = defineTest({
	description: 'parses an ArrayPattern',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ArrayPattern(node) {
							arrayPatterns.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
