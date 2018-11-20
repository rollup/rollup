module.exports = {
	description: 'Optimizing chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		experimentalPreserveModules: true,
		optimizeChunks: true
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'experimentalPreserveModules does not support the optimizeChunks option.'
	}
};
