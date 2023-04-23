module.exports = defineRollupTest({
	description: 'allows a namespace to be assigned to a variable',
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
