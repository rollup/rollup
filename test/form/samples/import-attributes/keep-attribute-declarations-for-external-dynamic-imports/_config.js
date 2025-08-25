module.exports = defineTest({
	description: 'Keep the attribute declarations for external dynamic imports',
	expectedWarnings: ['INVALID_IMPORT_ATTRIBUTE'],
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier) {
					if (specifier === 'specifier3' || specifier === 'specifier4') {
						return { id: specifier, external: true };
					}
					if (specifier.name === 'specifier5' || specifier.name === 'specifier6') {
						return `'${specifier.name}-replacement'`;
					}
				}
			}
		]
	},
	verifyAst: false
});
