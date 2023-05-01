const assert = require('node:assert');

module.exports = defineTest({
	description: 'external namespace reexport',
	options: {
		strictDeprecations: false,
		external: ['external'],
		output: {
			namespaceToStringTag: true
		}
	},
	exports(exports) {
		assert.strictEqual(typeof exports.maths, 'object');
		assert.strictEqual(exports[Symbol.toStringTag], 'Module');
		assert.strictEqual(exports.maths.external, true);
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
