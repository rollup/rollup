const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'exports default-as-named from sibling module',
	exports(exports) {
		assert.equal(exports.foo, 'FOO');
	}
});
