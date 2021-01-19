const path = require('path');

module.exports = {
	description: 'Throws when accessing the filename before it has been generated',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		plugins: {
			name: 'test-plugin',
			buildStart() {
				const chunkId = this.emitChunk('chunk.js');
				this.getChunkFileName(chunkId);
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'Plugin error - Unable to get file name for chunk "chunk.js". Ensure that generate is called first.',
		plugin: 'test-plugin',
		pluginCode: 'CHUNK_NOT_GENERATED',
		watchFiles: [path.join(__dirname, 'chunk.js')]
	}
};
