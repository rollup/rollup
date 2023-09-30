module.exports = defineTest({
	description: 'throws when the maximum hash size is exceeded',
	options: { output: { chunkFileNames: '[hash:23].js' } },
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'Hashes cannot be longer than 22 characters, received 23. Check the "output.chunkFileNames" option.'
	}
});
