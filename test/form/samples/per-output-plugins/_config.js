module.exports = defineTest({
	description: 'allows specifying per-output plugins',
	options: {
		output: {
			plugins: [
				{
					name: 'test-plugin',
					renderChunk(code, chunkDescription, { format }) {
						return code.replace(42, `'${format}'`);
					}
				},
				{
					renderChunk(code, chunkDescription, { format }) {
						return code.replace(43, `'!${format}!'`);
					}
				}
			]
		}
	}
});
