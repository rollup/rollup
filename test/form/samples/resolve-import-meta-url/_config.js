module.exports = defineTest({
	description: 'allows to configure import.meta.url',
	options: {
		plugins: [
			{
				resolveImportMeta(property, { chunkId, moduleId }) {
					if (!moduleId.endsWith('resolved.js')) {
						return `'${property}=${chunkId}:${moduleId
							.replace(/\\/g, '/')
							.split('/')
							.slice(-2)
							.join('/')}'`;
					}
					return null;
				}
			},
			{
				resolveImportMeta(property, { moduleId }) {
					if (!moduleId.endsWith('unresolved.js')) {
						return `'resolved'`;
					}
					return null;
				}
			}
		]
	}
});
