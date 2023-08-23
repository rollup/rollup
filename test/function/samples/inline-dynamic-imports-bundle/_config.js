const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'ignores non-bundled modules when inlining dynamic imports',
	options: {
		output: { inlineDynamicImports: true },
		plugins: [
			{
				generateBundle(options, bundle) {
					assert.deepStrictEqual(Object.keys(bundle['main.js'].modules), [
						path.join(__dirname, 'lib.js'),
						path.join(__dirname, 'main.js')
					]);
				}
			}
		]
	}
});
