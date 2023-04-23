const assert = require('node:assert');

module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to entry chunks with named exports',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true,
			exports: 'named'
		}
	},
	exports(exports) {
		assert.strictEqual(Object.prototype.toString.call(exports), '[object Module]');
		assert.strictEqual(exports[Symbol.toStringTag], 'Module');
		assert.strictEqual(exports.foo, 42);

		const copied = { ...exports };
		assert.deepStrictEqual(copied, { foo: 42 });
		assert.strictEqual(Object.prototype.toString.call(copied), '[object Object]');
		assert.strictEqual(copied[Symbol.toStringTag], undefined);
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.',
			url: 'https://rollupjs.org/configuration-options/#output-generatedcode-symbols'
		}
	]
});
