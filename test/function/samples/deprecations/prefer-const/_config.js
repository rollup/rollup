module.exports = {
	description: 'marks the "output.preferConst" option as deprecated',
	options: {
		output: {
			preferConst: true
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.preferConst" option is deprecated. Use the "output.generatedCode.constBindings" option instead.'
	}
};
