module.exports = {
	description: 'allows to configure import.meta.url',
	options: {
		output: {
			importMetaUrl(chunkId, moduleId) {
				return `'${chunkId}/${moduleId
					.split('/')
					.slice(-2)
					.join('/')}'`;
			}
		}
	}
};
