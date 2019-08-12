module.exports = {
	description: 'throws for invalid patterns',
	options: {
		output: { entryFileNames: '\0main.js' }
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'Invalid pattern "\0main.js" for "output.entryFileNames", patterns can be neither absolute nor relative paths and must not contain invalid characters.'
	}
};
