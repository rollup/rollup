module.exports = {
	description: 'Inlining dynamic imports is not supported when preserving modules',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		experimentalPreserveModules: true,
		inlineDynamicImports: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'experimentalPreserveModules does not support the inlineDynamicImports option.'
	}
};
