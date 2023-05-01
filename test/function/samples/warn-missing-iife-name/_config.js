module.exports = defineTest({
	description: 'warns if no name is provided for an IIFE bundle',
	options: { output: { format: 'iife' } },
	warnings: [
		{
			code: 'MISSING_NAME_OPTION_FOR_IIFE_EXPORT',
			message:
				'If you do not supply "output.name", you may not be able to access the exports of an IIFE bundle.',
			url: 'https://rollupjs.org/configuration-options/#output-name'
		}
	]
});
