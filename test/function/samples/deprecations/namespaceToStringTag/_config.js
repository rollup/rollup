module.exports = {
	description: 'marks the "output.namespaceToStringTag" option as deprecated',
	options: {
		output: {
			namespaceToStringTag: true
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.'
	}
};
