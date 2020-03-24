const assert = require('assert');
let imported = false;

module.exports = {
	description: 'allows specifying a custom importer function',
	context: {
		myImporter(path) {
			assert.equal(path, './foo.js');
			imported = true;
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
			format: 'es'
		}
	},
	exports() {
		assert.ok(imported);
	}
};
