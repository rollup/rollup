module.exports = {
	description: 'allows to configure import.meta.url',
	options: {
		plugins: [
			{
				resolveImportMeta(prop, { chunkId, moduleId }) {
					if (!moduleId.endsWith('resolved.js')) {
						return `'${prop}=${chunkId}:${moduleId
							.replace(/\\/g, '/')
							.split('/')
							.slice(-2)
							.join('/')}'`;
					}
					return null;
				}
			},
			{
				resolveImportMeta(prop, { moduleId }) {
					if (!moduleId.endsWith('unresolved.js')) {
						return `'resolved'`;
					}
					return null;
				}
			}
		]
	}
};
