module.exports = defineTest({
	description: 'throws when entryFileNames contains a mid-path traversal sequence',
	options: {
		output: {
			entryFileNames: 'a/../../pwned.js',
			format: 'es'
		}
	},
	generateError: {
		code: 'FILE_NAME_OUTSIDE_OUTPUT_DIRECTORY',
		message:
			'The output file name "a/../../pwned.js" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
