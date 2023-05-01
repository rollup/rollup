module.exports = defineTest({
	description: 'throws when using both the file and the dir option',
	options: {
		output: { file: 'bundle.js', dir: 'dist' }
	},
	generateError: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value for option "output.dir" - you must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks.',
		url: 'https://rollupjs.org/configuration-options/#output-dir'
	}
});
