module.exports = defineTest({
	description: 'handles vars with init in dead branch (#1198)',
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
