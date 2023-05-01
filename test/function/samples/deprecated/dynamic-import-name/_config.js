const assert = require('node:assert');
let imported = false;

module.exports = defineTest({
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
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "output.dynamicImportFunction" option is deprecated. Use the "renderDynamicImport" plugin hook instead.',
			url: 'https://rollupjs.org/plugin-development/#renderdynamicimport'
		}
	]
});
