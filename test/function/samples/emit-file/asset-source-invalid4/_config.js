module.exports = defineTest({
	description: 'throws when setting an empty asset source',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.emitFile({ type: 'asset', source: null });
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'Could not set source for unnamed asset, asset source needs to be a string, Uint8Array or Buffer.',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
