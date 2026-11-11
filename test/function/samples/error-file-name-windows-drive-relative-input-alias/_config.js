module.exports = defineTest({
	description: 'throws when an object-form input alias is a Windows drive-relative path',
	options: {
		input: { 'C:../../pwned': 'main.js' }
	},
	generateError: {
		code: 'FILE_NAME_OUTSIDE_OUTPUT_DIRECTORY',
		message:
			'The output file name "C:../../pwned.js" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
