const assert = require('node:assert');

module.exports = defineTest({
	description: 'creates an export as an exports property even if is has no initializer',
	exports(exports) {
		assert.strictEqual(exports.foo, undefined);
		assert.strictEqual(exports.bar, undefined);
		assert.strictEqual(exports.baz, undefined);
		assert.ok(exports.hasOwnProperty('foo'));
		assert.ok(exports.hasOwnProperty('bar'));
		assert.ok(exports.hasOwnProperty('baz'));
		exports.defineFooBar();
		assert.strictEqual(exports.foo, 'defined');
		assert.strictEqual(exports.bar, 'defined');
	}
});
