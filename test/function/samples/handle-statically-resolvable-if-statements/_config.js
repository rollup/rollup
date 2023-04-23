const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'handles statically resolvable "if" statements (#2134)',
	context: {
		value: 1
	},
	exports({ x }) {
		assert.equal(x, 1);
	}
});
