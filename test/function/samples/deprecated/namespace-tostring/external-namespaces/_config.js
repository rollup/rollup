module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to external namespaces',
	options: {
		strictDeprecations: false,
		external(id) {
			return id.startsWith('external');
		},
		output: {
			namespaceToStringTag: true,
			interop(id) {
				switch (id) {
					case 'external-auto': {
						return 'auto';
					}
					case 'external-default': {
						return 'default';
					}
					case 'external-defaultOnly': {
						return 'defaultOnly';
					}
					default: {
						throw new Error(`Unexpected require "${id}"`);
					}
				}
			}
		}
	},
	context: {
		require() {
			return { foo: 42 };
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
