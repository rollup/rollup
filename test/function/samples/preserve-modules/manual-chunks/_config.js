module.exports = {
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				lib: ['lib.js']
			},
			preserveModules: true
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: 'The "output.manualChunks" option is not supported for "output.preserveModules".'
	}
};
