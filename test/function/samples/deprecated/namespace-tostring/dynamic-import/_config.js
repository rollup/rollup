const assert = require('assert');

module.exports = {
	description: 'adds Symbol.toStringTag property to dynamic imports',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
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
};
