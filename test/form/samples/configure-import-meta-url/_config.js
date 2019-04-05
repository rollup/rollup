module.exports = {
	description: 'allows to configure import.meta.url',
	options: {
		plugins: [
			{
				resolveImportMetaUrl({ chunkId, moduleId }) {
					if (!moduleId.endsWith('resolved.js')) {
						return `'${chunkId}/${moduleId
							.replace(/\\/g, '/')
							.split('/')
							.slice(-2)
							.join('/')}'`;
					}
					return null;
				}
			},
			{
				resolveImportMetaUrl({ moduleId }) {
					if (!moduleId.endsWith('unresolved.js')) {
						return `'resolved'`;
					}
					return null;
				}
			}
		]
	}
};
