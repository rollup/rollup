module.exports = {
	description: 'marks this.emitChunk as deprecated',
	options: {
		plugins: {
			buildStart() {
				this.emitChunk('chunk');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: `The "this.emitChunk" plugin context function used by plugin at position 1 is deprecated. The "this.emitFile" plugin context function should be used instead.`,
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE'
	}
};
