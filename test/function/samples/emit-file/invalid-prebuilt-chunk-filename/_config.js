module.exports = defineTest({
	description: 'throws for invalid prebuilt chunks filename',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({
						type: 'prebuilt-chunk',
						code: 'console.log("my-chunk")'
					});
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The "fileName" property of emitted prebuilt chunks must be strings that are neither absolute nor relative paths, received "undefined".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
