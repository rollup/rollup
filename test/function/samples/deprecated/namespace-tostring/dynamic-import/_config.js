const assert = require('node:assert');

module.exports = defineTest({
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
