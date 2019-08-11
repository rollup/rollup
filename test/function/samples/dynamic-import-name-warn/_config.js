const assert = require('assert');

module.exports = {
	description: 'warns when specifying a custom importer function for formats other than "esm"',
	context: {
		require(path) {
			assert.equal(path, './foo.js');
			return 42;
		}
	},
	options: {
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
		return exports.fromFoo.then(value => assert.deepStrictEqual(value, { default: 42 }));
	},
	warnings: [
		{
			code: 'INVALID_OPTION',
			message: '"output.dynamicImportFunction" is ignored for formats other than "esm".'
		}
	]
};
