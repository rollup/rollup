const assert = require('node:assert');

module.exports = defineTest({
	description: 'avoids name conflicts with local variables named Object',
	options: {
		external: 'external',
		output: { exports: 'named' }
	},
	context: {
		require() {
			return { foo: 'foo' };
		}
	},
	exports(exports) {
		assert.strictEqual(exports.Object, null);
		assert.strictEqual(exports.default, 'bar');
		assert.strictEqual(exports.foo.foo, 'foo');
		assert.strictEqual(exports.foo.default.foo, 'foo');
	}
});
