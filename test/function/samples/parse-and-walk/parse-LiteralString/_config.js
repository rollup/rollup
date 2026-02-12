const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralString (as Literal)',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						Literal(node) {
							literals.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(literals, [
			{ type: 'Literal', start: 15, end: 21, value: 'test', raw: "'test'" }
		]);
	}
});
