module.exports = {
	description: 'Manual chunks are not supported when inlining dynamic imports',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		inlineDynamicImports: true,
		manualChunks: {
			lib: ['lib.js']
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: '"manualChunks" option is not supported for "inlineDynamicImports".'
	}
};
