module.exports = {
	description: 'allows specifying per-output plugins',
	options: {
		output: {
			plugins: {
				renderChunk(code, chunkDescription, { format }) {
					return code.replace(42, `'${format}'`);
				}
			}
		}
	}
};
