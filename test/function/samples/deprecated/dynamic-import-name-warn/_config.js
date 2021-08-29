const assert = require('assert');

module.exports = {
	description: 'warns when specifying a custom importer function for formats other than "es"',
	context: {
		require(path) {
			assert.equal(path, './foo.js');
			return 42;
		}
	},
	options: {
		strictDeprecations: false,
		input: 'main.js',
		plugins: {
			resolveDynamicImport() {
				return false;
			}
		},
		output: {
			dynamicImportFunction: 'myImporter',
			format: 'cjs'
		}
	},
	exports(exports) {
		return exports.fromFoo.then(value =>
			assert.deepStrictEqual(value, { __proto__: null, default: 42 })
		);
	},
	warnings: [
		{
			code: 'INVALID_OPTION',
			message:
				'Invalid value for option "output.dynamicImportFunction" - this option is ignored for formats other than "es".',
			url: 'https://rollupjs.org/guide/en/#outputdynamicImportFunction'
		}
	]
};
