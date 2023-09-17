module.exports = defineTest({
	description: 'throws for invalid prebuilt chunks code',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({
						type: 'prebuilt-chunk',
						fileName: 'my-chunk.js'
					});
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Emitted prebuilt chunks need to have a valid string code, received "undefined".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
