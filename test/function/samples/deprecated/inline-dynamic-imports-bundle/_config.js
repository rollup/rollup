const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'ignores non-bundled modules when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		inlineDynamicImports: true,
		plugins: {
			generateBundle(options, bundle) {
				assert.deepStrictEqual(Object.keys(bundle['main.js'].modules), [
					path.join(__dirname, 'lib.js'),
					path.join(__dirname, 'main.js')
				]);
			}
		}
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
