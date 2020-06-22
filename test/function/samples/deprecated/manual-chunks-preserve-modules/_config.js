module.exports = {
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		manualChunks: {
			lib: ['lib.js']
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'The "output.manualChunks" option is not supported for "output.preserveModules".'
	}
};
