let chunkId;

module.exports = {
	description: 'Throws when accessing the filename before it has been generated in buildEnd',
	options: {
		input: 'main.js',
		plugins: {
			name: 'test-plugin',
			buildStart() {
				chunkId = this.emitFile({ type: 'chunk', id: 'chunk.js' });
			},
			buildEnd() {
				this.getFileName(chunkId);
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildEnd',
		message:
			'Plugin error - Unable to get file name for chunk "chunk.js". Ensure that generate is called first.',
		plugin: 'test-plugin',
		pluginCode: 'CHUNK_NOT_GENERATED'
	}
};
