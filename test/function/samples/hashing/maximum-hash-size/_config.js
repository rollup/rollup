module.exports = defineTest({
	description: 'throws when the maximum hash size is exceeded',
	options: { output: { chunkFileNames: '[hash:22].js' } },
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'Hashes cannot be longer than 21 characters, received 22. Check the "output.chunkFileNames" option.'
	}
});
