const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'renders valid CommonJS declarations for exported var declarations in for-initializers and braceless loop bodies',
	options: { output: { format: 'cjs' } },
	exports(exports) {
		assert.equal(exports.a, 3);
		assert.equal(exports.c, 2);
		assert.equal(exports.unusedCase, 3);
		assert.equal(exports.noInitA, undefined);
		assert.equal(exports.noInitB, 3);
		assert.equal(exports.forOfA, 2);
		assert.equal(exports.forOfB, 2);
		assert.equal(exports.whileA, 1);
		assert.equal(exports.whileB, 2);
		assert.equal(exports.doA, 1);
		assert.equal(exports.doB, 1);
		assert.equal(exports.catchA, 1);
		assert.equal(exports.catchB, 1);
	}
});
