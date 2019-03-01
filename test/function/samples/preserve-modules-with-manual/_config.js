module.exports = {
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		preserveModules: true,
		manualChunks: {
			lib: ['lib.js']
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message: '"preserveModules" does not support the "manualChunks" option.'
	}
};
