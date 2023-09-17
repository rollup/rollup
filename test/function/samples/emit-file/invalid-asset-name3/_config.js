module.exports = defineTest({
	description: 'throws for invalid asset names with absolute path on Windows OS',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({ type: 'asset', name: 'F:\\test.ext', source: 'content' });
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The "fileName" or "name" properties of emitted chunks and assets must be strings that are neither absolute nor relative paths, received "F:\\test.ext".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
