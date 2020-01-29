module.exports = {
	description: 'Having multiple inputs in an object is not supported when inlining dynamic imports',
	options: {
		input: { main: 'main.js', lib: 'lib.js' },
		inlineDynamicImports: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'Multiple inputs are not supported for "inlineDynamicImports".'
	}
};
