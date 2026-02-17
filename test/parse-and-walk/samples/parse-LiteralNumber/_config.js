const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralNumber (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.deepEqual(literals, [{ type: 'Literal', start: 15, end: 17, raw: '42', value: 42 }]);
	}
});
