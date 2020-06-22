const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'ignores non-bundled modules when inlining dynamic imports',
	options: {
		output: { inlineDynamicImports: true },
		plugins: {
			generateBundle(options, bundle) {
				assert.deepStrictEqual(Object.keys(bundle['main.js'].modules), [
					path.join(__dirname, 'lib.js'),
					path.join(__dirname, 'main.js')
				]);
			}
		}
	}
};
