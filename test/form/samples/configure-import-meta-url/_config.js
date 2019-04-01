module.exports = {
	description: 'allows to configure import.meta.url',
	options: {
		output: {
			importMetaUrl(chunkId, moduleId) {
				return `'${chunkId}/${moduleId
					.replace(/\\/g, '/')
					.split('/')
					.slice(-2)
					.join('/')}'`;
			}
		}
	}
};
