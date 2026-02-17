const assert = require('node:assert/strict');

const literals = [];

module.exports = defineTest({
	description: 'parses a LiteralNull (as Literal)',
	walk: {
		Literal(node) {
			literals.push(node);
		}
	},
	assertions() {
		assert.deepEqual(literals, [{ type: 'Literal', start: 15, end: 19, raw: 'null', value: null }]);
	}
});
