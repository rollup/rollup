module.exports = {
	description: 'allows specifying a custom importer function',
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
