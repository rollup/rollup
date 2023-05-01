const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not add Symbol.toStringTag property to entry chunks with default export mode',
	options: {
		output: {
			generatedCode: { symbols: true },
			exports: 'default'
		}
	},
	exports(exports) {
		assert.strictEqual(exports[Symbol.toStringTag], undefined);
		assert.strictEqual(Object.prototype.toString.call(exports), '[object Object]');
		assert.strictEqual(exports.foo, 42);
	}
});
