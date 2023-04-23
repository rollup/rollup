module.exports = defineTest({
	description: 'should not remove inline comments inside dynamic import',
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
