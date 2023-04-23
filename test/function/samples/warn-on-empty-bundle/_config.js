module.exports = defineTest({
	description: 'warns if empty bundle is generated  (#444)',
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
