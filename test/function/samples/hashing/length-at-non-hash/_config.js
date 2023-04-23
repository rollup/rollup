module.exports = defineTest({
	description: 'throws when configuring a length for placeholder other than "hash"',
	options: { output: { chunkFileNames: '[name:3].js' } },
	generateError: {
		code: 'VALIDATION_ERROR',
		message: '"[name:3]" is not a valid placeholder in the "output.chunkFileNames" pattern.'
	}
});
