module.exports = {
	description: 'warns if empty bundle is generated  (#444)',
	warnings: [
		{
			chunkName: 'main',
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main"'
		}
	]
};
