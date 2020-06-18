module.exports = {
	description: 'Manual chunks are not supported when inlining dynamic imports',
	options: {
		input: ['main.js'],
		inlineDynamicImports: true,
		output: {
			manualChunks: {
				lib: ['lib.js']
			}
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: '"manualChunks" option is not supported for "inlineDynamicImports".'
	}
};
