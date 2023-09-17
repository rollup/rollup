module.exports = defineTest({
	description: 'throws for invalid chunk ids',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({ type: 'chunk', id: null });
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Emitted chunks need to have a valid string id, received "null"',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
