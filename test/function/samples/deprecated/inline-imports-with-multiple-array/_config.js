module.exports = {
	description: 'Having multiple inputs in an array is not supported when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		input: ['main.js', 'lib.js'],
		inlineDynamicImports: true
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'Multiple inputs are not supported for "output.inlineDynamicImports".'
	}
};
