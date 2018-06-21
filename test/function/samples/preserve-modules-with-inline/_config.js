module.exports = {
	description: 'Inlining dynamic imports is not supported when preserving modules',
	options: {
		input: ['main.js'],
		preserveModules: true,
		inlineDynamicImports: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'preserveModules does not support the inlineDynamicImports option.'
	}
};
