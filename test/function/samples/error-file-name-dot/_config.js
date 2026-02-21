module.exports = defineTest({
	description: 'throws when entryFileNames is "."',
	options: {
		output: {
			entryFileNames: '.',
			format: 'es'
		}
	},
	generateError: {
		code: 'FILE_NAME_OUTSIDE_OUTPUT_DIRECTORY',
		message:
			'The output file name "." is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
