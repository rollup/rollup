module.exports = {
	description: 'throws for invalid asset names',
	options: {
		strictDeprecations: false,
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitAsset('/test.ext', 'content');
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths, received "/test.ext".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
};
