module.exports = defineTest({
	description: 'throws when the maximum hash size is exceeded',
	options: { output: { chunkFileNames: '[hash:3].js' } },
	generateError: {
		code: 'VALIDATION_ERROR',
		message:
			'To generate hashes for this number of chunks (currently 1), you need a minimum hash size of 6, received 3. Check the "output.chunkFileNames" option.'
	}
});
