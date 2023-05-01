const assert = require('node:assert');

module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to dynamic imports',
	options: {
		output: {
			generatedCode: { symbols: true }
		}
	},
	async exports(exports) {
		const namespace = await exports;
		assert.strictEqual(Object.prototype.toString.call(namespace), '[object Module]');
		assert.strictEqual(namespace[Symbol.toStringTag], 'Module');
		assert.strictEqual(namespace.bar, 42);

		const copied = { ...namespace };
		assert.deepStrictEqual(copied, { bar: 42 });
		assert.strictEqual(Object.prototype.toString.call(copied), '[object Object]');
		assert.strictEqual(copied[Symbol.toStringTag], undefined);
	}
});
