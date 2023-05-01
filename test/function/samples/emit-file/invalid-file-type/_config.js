module.exports = defineTest({
	description: 'throws for invalid file types',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({ type: 'unknown' });
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Emitted files must be of type "asset" or "chunk", received "unknown".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
