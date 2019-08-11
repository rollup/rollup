module.exports = {
	description: 'throws for invalid asset names with special characters',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({ type: 'asset', name: '\0test.ext', source: 'content' });
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The "fileName" or "name" properties of emitted files must be strings that are neither absolute nor relative paths and do not contain invalid characters, received "\u0000test.ext".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
};
