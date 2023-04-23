module.exports = defineTest({
	description: 'throws when the maximum hash size is exceeded',
	options: { output: { chunkFileNames: '[hash:65].js' } },
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'Hashes cannot be longer than 64 characters, received 65. Check the "output.chunkFileNames" option.'
	}
});
