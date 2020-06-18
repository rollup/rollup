module.exports = {
	description: 'Assigning manual chunks fails when preserving modules',
	options: {
		input: ['main.js'],
		preserveModules: true,
		output: {
			manualChunks: {
				lib: ['lib.js']
			}
		}
	},
	generateError: {
		code: 'INVALID_OPTION',
		message: '"preserveModules" does not support the "manualChunks" option.'
	}
};
