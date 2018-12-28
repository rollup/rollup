module.exports = {
	description: 'Optimizing chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		preserveModules: true,
		experimentalOptimizeChunks: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'preserveModules does not support the experimentalOptimizeChunks option.'
	}
};
