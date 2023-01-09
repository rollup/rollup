module.exports = {
	description: 'export type must be auto, default, named or none',
	options: { output: { exports: 'blah' } },
	generateError: {
		code: 'INVALID_EXPORT_OPTION',
		url: 'https://rollupjs.org/999-big-list-of-options.html#output-exports',
		message:
			'"output.exports" must be "default", "named", "none", "auto", or left unspecified (defaults to "auto"), received "blah".'
	}
};
