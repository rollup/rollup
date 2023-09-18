module.exports = defineTest({
	description: 'throws when trying to emit files from the outputOptions hook',
	options: {
		input: 'main',
		plugins: [
			{
				outputOptions() {
					this.emitFile({
						type: 'asset',
						source: 'asset'
					});
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
