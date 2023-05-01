const assert = require('node:assert');

// This used to be "any global variables in scope can be re-exported"
// This, however, is actually not allowed by the spec and acorn,
// see https://github.com/acornjs/acorn/issues/806
// Consider reverting this change should this become an acorn option

module.exports = defineTest({
	description: '"variables corresponding to globals can be exported"',

	exports(exports) {
		assert.equal(exports.Buffer, Buffer);
	}
});
