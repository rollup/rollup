module.exports = {
	description: 'Inlining dynamic imports is not supported when preserving modules',
	options: {
		input: ['main.js'],
		output: {
			preserveModules: true,
			inlineDynamicImports: true
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'The "output.inlineDynamicImports" option is not supported for "output.preserveModules".'
	}
};
