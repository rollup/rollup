module.exports = {
	description: 'handles vars with init in dead branch (#1198)',
	warnings: [
		{
			chunkName: 'main',
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main"'
		}
	]
};
