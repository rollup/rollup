module.exports = defineTest({
	description: 'allows specifying a custom importer function',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		onwarn() {},
		plugins: {
			resolveDynamicImport() {
				return false;
			}
		},
		output: {
			dynamicImportFunction: 'foobar'
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
