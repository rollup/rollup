module.exports = {
	description: 'Optimizing chunks is not supported when inlining dynamic imports',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		inlineDynamicImports: true,
		experimentalOptimizeChunks: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: '"experimentalOptimizeChunks" option is not supported for inlineDynamicImports.'
	}
};
