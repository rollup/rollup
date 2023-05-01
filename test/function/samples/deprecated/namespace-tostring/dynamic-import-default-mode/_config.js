const assert = require('node:assert');

module.exports = defineTest({
	description:
		'adds Symbol.toStringTag property to dynamic imports of entry chunks with default export mode',
	options: {
		strictDeprecations: false,
		input: ['main', 'foo'],
		output: {
			namespaceToStringTag: true
		}
	},
	async exports(exports) {
		const foo = await exports;
		assert.strictEqual(foo[Symbol.toStringTag], 'Module');
		assert.strictEqual(Object.prototype.toString.call(foo), '[object Module]');
		assert.strictEqual(foo.default, 42);
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
