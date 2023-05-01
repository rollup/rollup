module.exports = defineTest({
	description: 'generated interop namespaces should have correct Symbol.toStringTag',
	context: {
		require() {
			return { answer: 42 };
		}
	},
	options: {
		strictDeprecations: false,
		external(id) {
			return id.includes('external');
		},
		output: {
			namespaceToStringTag: true,
			interop(id) {
				return id.split('-')[1];
			}
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
