let chunkId;

module.exports = {
	description: 'Throws when accessing the filename before it has been generated in renderStart',
	options: {
		input: 'main.js',
		plugins: {
			name: 'test-plugin',
			buildStart() {
				chunkId = this.emitFile({ type: 'chunk', id: 'chunk.js' });
			},
			renderStart() {
				this.getFileName(chunkId);
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderStart',
		message:
			'Plugin error - Unable to get file name for chunk "chunk.js". Ensure that generate is called first.',
		plugin: 'test-plugin',
		pluginCode: 'CHUNK_NOT_GENERATED'
	}
};
