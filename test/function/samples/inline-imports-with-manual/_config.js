module.exports = {
	description: 'Manual chunks are not supported when inlining dynamic imports',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		inlineDynamicImports: true,
		manualChunks: {
			lib: ['lib.js']
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message: '"manualChunks" option is not supported for inlineDynamicImports.'
	}
};
