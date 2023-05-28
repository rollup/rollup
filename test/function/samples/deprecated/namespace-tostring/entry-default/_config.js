const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not add Symbol.toStringTag property to entry chunks with default export mode',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true,
			exports: 'default'
		}
	},
	exports(exports) {
		assert.strictEqual(exports[Symbol.toStringTag], undefined);
		assert.strictEqual(Object.prototype.toString.call(exports), '[object Object]');
		assert.strictEqual(exports.foo, 42);
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
