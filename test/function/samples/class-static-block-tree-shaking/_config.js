module.exports = defineTest({
	description: 'treeshakes no effect static blocks',
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
