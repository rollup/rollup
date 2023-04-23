module.exports = defineRollupTest({
	description: 'supports import.meta.url',
	options: {
		preserveEntrySignatures: false,
		output: {
			chunkFileNames: 'nested/chunk.js'
		}
	}
});
