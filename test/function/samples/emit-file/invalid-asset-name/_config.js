module.exports = defineTest({
	description: 'throws for invalid asset names',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({ type: 'asset', name: '/test.ext', source: 'content' });
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The "fileName" or "name" properties of emitted chunks and assets must be strings that are neither absolute nor relative paths, received "/test.ext".',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
