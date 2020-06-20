module.exports = {
	description: 'Having multiple inputs in an array is not supported when inlining dynamic imports',
	options: {
		input: ['main.js', 'lib.js'],
		output: { inlineDynamicImports: true }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'Multiple inputs are not supported for "output.inlineDynamicImports".'
	}
};
