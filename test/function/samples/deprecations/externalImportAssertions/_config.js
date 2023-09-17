module.exports = defineTest({
	description: 'marks the "output.externalImportAssertions" option as deprecated',
	options: {
		output: { externalImportAssertions: false }
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "output.externalImportAssertions" option is deprecated. Use the "output.externalImportAttributes" option instead.',
		url: 'https://rollupjs.org/configuration-options/#output-externalimportattributes'
	}
});
