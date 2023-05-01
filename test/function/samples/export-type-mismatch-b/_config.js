module.exports = defineTest({
	description: 'export type must be auto, default, named or none',
	options: { output: { exports: 'blah' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		url: 'https://rollupjs.org/configuration-options/#output-exports',
		message:
			'"output.exports" must be "default", "named", "none", "auto", or left unspecified (defaults to "auto"), received "blah".'
	}
});
