const assert = require('node:assert');

module.exports = defineTest({
	description: 'ignores conflict between import declaration and export from declaration',
	exports(exports) {
		assert.equal(exports.foo, 'a-bar');
		assert.equal(exports.bar, 'a-foo');
		assert.equal(exports.baz, 'a-baz');
	}
});

// https://github.com/rollup/rollup/issues/16
