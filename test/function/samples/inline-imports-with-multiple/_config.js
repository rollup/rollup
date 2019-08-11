module.exports = {
	description: 'Having multiple inputs is not supported when inlining dynamic imports',
	options: {
		input: ['main.js', 'lib.js'],
		inlineDynamicImports: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'Multiple inputs are not supported for "inlineDynamicImports".'
	}
};
