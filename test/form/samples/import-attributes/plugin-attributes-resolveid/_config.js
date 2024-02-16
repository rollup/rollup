module.exports = defineTest({
	description: 'allows plugins to read and write import attributes in resolveId',
	// This is an artifact of how we check for attribute conflicts with
	// dynamic dependencies and caching
	expectedWarnings: ['INCONSISTENT_IMPORT_ATTRIBUTES'],
	options: {
		output: { name: 'bundle' },
		plugins: [
			{
				name: 'test',
				resolveId(source, importer, { attributes, isEntry }) {
					return {
						id: source,
						external: !isEntry,
						attributes: Object.fromEntries(Object.keys(attributes).map(key => [key, 'changed']))
					};
				}
			}
		]
	}
});
