module.exports = {
	description:
		'handle dynamically importing a module with synthetic named exports when preserving modules',
	options: {
		input: ['main', 'lib'],
		plugins: {
			name: 'test-plugin',
			transform(code, id) {
				if (id.endsWith('lib.js')) {
					return { code, syntheticNamedExports: '__moduleExports' };
				}
			}
		},
		output: {
			exports: 'named',
			preserveModules: true
		}
	}
};
