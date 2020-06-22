module.exports = {
	description: 'Having multiple inputs in an object is not supported when inlining dynamic imports',
	options: {
		input: { main: 'main.js', lib: 'lib.js' },
		output: { inlineDynamicImports: true }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'Multiple inputs are not supported for "output.inlineDynamicImports".'
	}
};
