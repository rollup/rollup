module.exports = {
	description: 'Throws when adding a chunk after the modules have finished loading',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		plugins: {
			name: 'test-plugin',
			buildEnd() {
				this.emitChunk('chunk.js');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildEnd',
		message: 'Cannot emit chunks after module loading has finished.',
		plugin: 'test-plugin',
		pluginCode: 'INVALID_ROLLUP_PHASE'
	}
};
