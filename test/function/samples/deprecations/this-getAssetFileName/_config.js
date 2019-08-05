module.exports = {
	description: 'marks this.getAssetFileName as deprecated',
	options: {
		plugins: {
			renderChunk() {
				this.getAssetFileName(this.emitFile({ type: 'asset', name: 'asset', source: 'asset' }));
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderChunk',
		message:
			'The "this.getAssetFileName" plugin context function used by plugin at position 1 is deprecated. The "this.getFileName" plugin context function should be used instead.',
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE'
	}
};
