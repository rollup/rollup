let chunkReferenceId;

module.exports = {
	description: 'marks this.getChunkFileName as deprecated',
	options: {
		plugins: {
			buildStart() {
				chunkReferenceId = this.emitFile({ type: 'chunk', id: 'chunk' });
			},
			renderChunk() {
				this.getChunkFileName(chunkReferenceId);
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderChunk',
		message:
			'The "this.getChunkFileName" plugin context function used by plugin at position 1 is deprecated. The "this.getFileName" plugin context function should be used instead.',
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE'
	}
};
