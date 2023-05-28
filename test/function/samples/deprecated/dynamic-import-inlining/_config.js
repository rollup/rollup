const assert = require('node:assert');

module.exports = defineTest({
	description: 'Dynamic import inlining',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true
	},
	exports(exports) {
		assert.equal(exports.x, 41);
		return exports.promise.then(y => {
			assert.equal(y, 42);
		});
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "inlineDynamicImports" option is deprecated. Use the "output.inlineDynamicImports" option instead.',
			url: 'https://rollupjs.org/configuration-options/#output-inlinedynamicimports'
		}
	]
});
