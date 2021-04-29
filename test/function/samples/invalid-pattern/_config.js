module.exports = {
	description: 'throws for invalid patterns',
	options: {
		output: { entryFileNames: '../main.js' }
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'Invalid pattern "../main.js" for "output.entryFileNames", patterns can be neither absolute nor relative paths.'
	}
};
