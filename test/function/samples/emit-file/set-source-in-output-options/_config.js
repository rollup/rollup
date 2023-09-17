let referenceId;

module.exports = defineTest({
	description: 'throws when trying to set file sources in  the outputOptions hook',
	options: {
		input: 'main',
		plugins: [
			{
				buildStart() {
					referenceId = this.emitFile({ type: 'asset' });
				},
				outputOptions() {
					this.setAssetSource(referenceId, 'not allowed');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'outputOptions',
		message:
			'Cannot emit files or set asset sources in the "outputOptions" hook, use the "renderStart" hook instead.',
		plugin: 'at position 1',
		pluginCode: 'CANNOT_EMIT_FROM_OPTIONS_HOOK'
	}
});
