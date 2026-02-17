const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralRegExp (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.strictEqual(literals.length, 1);
		assert.strictEqual(literals[0].type, 'Literal');
	}
});
