module.exports = {
	description: 'Throws when adding a chunk after the modules have finished loading',
	options: {
		input: 'main.js',
		plugins: {
			name: 'test-plugin',
			buildEnd() {
				this.emitEntryChunk('chunk.js');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildEnd',
		message: 'Cannot call emitEntryChunk after module loading has finished.',
		plugin: 'test-plugin',
		pluginCode: 'INVALID_ROLLUP_PHASE'
	}
};
