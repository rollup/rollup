module.exports = {
	description: 'marks dynamic imports as external when resolveDynamicImport returns false',
	options: {
		input: 'main.js',
		plugins: {
			resolveDynamicImport(specifier) {
				return false;
			}
		}
	}
};
