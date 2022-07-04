const assert = require('assert');

module.exports = {
	description:
		'deconflicts variables when nested dynamic imports are inlined via inlineDynamicImports',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	exports(exports) {
		return exports().then(result => assert.strictEqual(result, 43));
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "inlineDynamicImports" option is deprecated. Use the "output.inlineDynamicImports" option instead.'
		}
	]
};
