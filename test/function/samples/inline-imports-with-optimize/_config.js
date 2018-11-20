module.exports = {
	description: 'Optimizing chunks is not supported when inlining dynamic imports',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		inlineDynamicImports: true,
		optimizeChunks: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: '"optimizeChunks" option is not supported for inlineDynamicImports.'
	}
};
