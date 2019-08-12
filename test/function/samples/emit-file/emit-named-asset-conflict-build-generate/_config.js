module.exports = {
	description:
		'throws when there is a conflict between two named assets emitted during different phases',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				this.emitFile({
					type: 'asset',
					fileName: 'custom/emitted.txt',
					source: 'text'
				});
			},
			renderStart() {
				this.emitFile({
					type: 'asset',
					fileName: 'custom/emitted.txt',
					source: 'text'
				});
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderStart',
		message:
			'Could not emit file "custom/emitted.txt" as it conflicts with an already emitted file.',
		plugin: 'at position 1',
		pluginCode: 'FILE_NAME_CONFLICT'
	}
};
