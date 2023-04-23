const assert = require('node:assert');

const foo = {};

module.exports = defineRollupTest({
	description: 'tracks mutations of aliased objects',
	context: {
		foo
	},
	exports() {
		assert.equal(foo.x, 42);
	}
});
