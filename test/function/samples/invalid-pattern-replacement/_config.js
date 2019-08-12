module.exports = {
	description: 'throws for invalid placeholders in patterns',
	options: {
		output: { entryFileNames: '[invalid].js' }
	},
	generateError: {
		code: 'VALIDATION_ERROR',
		message: '"[invalid]" is not a valid placeholder in "output.entryFileNames" pattern.'
	}
};
