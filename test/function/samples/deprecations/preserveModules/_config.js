module.exports = {
	description: 'marks the "preserveModules" input option as deprecated',
	options: {
		preserveModules: true
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "preserveModules" option is deprecated. Use the "output.preserveModules" option instead.'
	}
};
