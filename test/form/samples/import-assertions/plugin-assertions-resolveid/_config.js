module.exports = defineTest({
	description: 'allows plugins to read and write import assertions in resolveId',
	options: {
		output: { name: 'bundle' },
		plugins: [
			{
				name: 'test',
				resolveId(source, importer, { assertions, isEntry }) {
					return {
						id: source,
						external: !isEntry,
						assertions: Object.fromEntries(Object.keys(assertions).map(key => [key, 'changed']))
					};
				}
			}
		]
	}
});
