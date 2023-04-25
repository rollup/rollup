module.exports = defineTest({
	description: 'allows plugins to read and write import assertions in resolveDynamicImport',
	options: {
		plugins: [
			{
				name: 'test',
				resolveDynamicImport(specifier, importer, { assertions }) {
					const resolutionOptions = {
						external: true,
						assertions: Object.fromEntries(Object.keys(assertions).map(key => [key, 'changed']))
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
