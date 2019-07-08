module.exports = {
	description: 'correctly exports resolved import.meta.url',
	options: {
		plugins: [
			{
				resolveImportMeta(prop) {
					return prop ? "'url'" : "'meta'";
				}
			}
		],
		output: { name: 'bundle' }
	}
};
