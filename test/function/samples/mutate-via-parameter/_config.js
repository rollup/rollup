const assert = require('node:assert');

module.exports = defineTest({
	description:
		'respects variable mutations via unknown parameter values if we lose track of a function',
	exports({ test }) {
		assert.ok(test(state => (state.modified = true)));
	}
});
