module.exports = defineTest({
	description: 'throws when trying to set the asset source of a chunk',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					const referenceId = this.emitFile({ type: 'chunk', id: 'chunk' });
					this.setAssetSource(referenceId, 'hello world');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Asset sources can only be set for emitted assets but "BVuJu3dA" is an emitted chunk.',
		plugin: 'test-plugin',
		pluginCode: 'VALIDATION_ERROR'
	}
});
