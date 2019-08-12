module.exports = {
	description: 'should not remove inline comments inside dynamic import',
	options: {
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
	}
};
