module.exports = {
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		experimentalPreserveModules: true,
		manualChunks: {
			lib: ['lib.js']
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message: 'experimentalPreserveModules does not support the manualChunks option.'
	}
};
