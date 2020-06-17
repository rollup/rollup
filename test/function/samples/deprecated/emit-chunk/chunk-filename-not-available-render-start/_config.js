let chunkId;

module.exports = {
	description: 'Throws when accessing the filename in renderStart',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		plugins: {
			name: 'test-plugin',
			buildStart() {
				chunkId = this.emitChunk('chunk.js');
			},
			renderStart() {
				this.getChunkFileName(chunkId);
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
