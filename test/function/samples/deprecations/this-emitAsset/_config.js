module.exports = {
	description: 'marks this.emitAsset as deprecated',
	options: {
		plugins: {
			buildStart() {
				this.emitAsset('asset', 'asset');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: `The "this.emitAsset" plugin context function used by plugin at position 1 is deprecated. The "this.emitFile" plugin context function should be used instead.`,
		plugin: 'at position 1',
		pluginCode: 'DEPRECATED_FEATURE'
	}
};
