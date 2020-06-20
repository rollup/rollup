module.exports = {
	description: 'Manual chunks are not supported when inlining dynamic imports',
	options: {
		input: ['main.js'],
		output: {
			inlineDynamicImports: true,
			manualChunks: {
				lib: ['lib.js']
			}
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'The "output.manualChunks" option is not supported for "output.inlineDynamicImports".'
	}
};
