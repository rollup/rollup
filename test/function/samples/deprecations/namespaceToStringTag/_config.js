module.exports = defineTest({
	description: 'marks the "output.namespaceToStringTag" option as deprecated',
	options: {
		output: {
			namespaceToStringTag: true
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.',
		url: 'https://rollupjs.org/configuration-options/#output-generatedcode-symbols'
	}
});
