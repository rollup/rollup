module.exports = defineTest({
	description: 'allows plugins to read and write import attributes in resolveDynamicImport',
	options: {
		plugins: [
			{
				name: 'test',
				resolveDynamicImport(specifier, importer, { attributes }) {
					const resolutionOptions = {
						external: true,
						attributes: Object.fromEntries(Object.keys(attributes).map(key => [key, 'changed']))
					};
					if (typeof specifier === 'object') {
						if (specifier.type === 'TemplateLiteral') {
							return { id: 'resolved-a', ...resolutionOptions };
						}
						return { id: 'resolved-b', ...resolutionOptions };
					}
					return { id: specifier, ...resolutionOptions };
				}
			}
		]
	}
});
