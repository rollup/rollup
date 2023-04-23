module.exports = defineTest({
	description: 'supports import.meta.url',
	options: {
		preserveEntrySignatures: false,
		output: {
			chunkFileNames: 'nested/chunk.js'
		}
	}
});
