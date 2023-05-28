module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to inlined namespaces',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.',
			url: 'https://rollupjs.org/configuration-options/#output-generatedcode-symbols'
		}
	]
});
