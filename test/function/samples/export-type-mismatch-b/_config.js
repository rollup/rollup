module.exports = {
	description: 'export type must be auto, default, named or none',
	options: { output: { exports: 'blah' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		message:
			'"output.exports" must be "default", "named", "none", "auto", or left unspecified (defaults to "auto"), received "blah"',
		url: 'https://rollupjs.org/guide/en/#outputexports'
	}
};
