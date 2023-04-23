module.exports = defineRollupTest({
	description: 'correctly exports resolved import.meta.url',
	options: {
		plugins: [
			{
				resolveImportMeta(property) {
					return property ? "'url'" : "'meta'";
				}
			}
		],
		output: { name: 'bundle' }
	}
});
