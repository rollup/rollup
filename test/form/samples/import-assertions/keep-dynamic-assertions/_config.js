module.exports = {
	description: 'keep import assertions for dynamic imports',
	options: {
		external: true,
		plugins: [
			{
				resolveDynamicImport(specifier, importer) {
					if (typeof specifier === 'object') {
						if (specifier.type === 'TemplateLiteral') {
							return "'resolvedString'";
						}
						if (specifier.type === 'BinaryExpression') {
							return { id: 'resolved-id', external: true };
						}
					} else if (specifier === 'external-resolved') {
						return { id: 'resolved-different', external: true };
					}
					return null;
				}
			}
		]
	}
};
