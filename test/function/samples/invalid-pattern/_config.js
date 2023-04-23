module.exports = defineTest({
	description: 'throws for invalid patterns',
	options: {
		output: { entryFileNames: '../main.js' }
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'Invalid pattern "../main.js" for "output.entryFileNames", patterns can be neither absolute nor relative paths. If you want your files to be stored in a subdirectory, write its name without a leading slash like this: subdirectory/pattern.'
	}
});
