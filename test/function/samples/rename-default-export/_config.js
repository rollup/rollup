const assert = require('node:assert');

module.exports = defineTest({
	description: 'avoids SyntaxError with default token (#33)',
	exports(exports) {
		assert.equal(exports.foo, 42);
		assert.equal(exports.bar, 42);
	}
});
