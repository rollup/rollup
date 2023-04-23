module.exports = defineTest({
	description: 'throws when generating multiple chunks for an IIFE build',
	options: {
		output: { format: 'iife' }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value "iife" for option "output.format" - UMD and IIFE output formats are not supported for code-splitting builds.',
		url: 'https://rollupjs.org/configuration-options/#output-format'
	}
});
