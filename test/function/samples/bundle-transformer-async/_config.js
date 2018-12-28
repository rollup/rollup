module.exports = {
	description: 'bundle transformers can be asynchronous',
	options: {
		plugins: [
			{
				transformBundle(code) {
					return Promise.resolve(code.replace('x', 1));
				}
			},
			{
				transformBundle(code) {
					return code.replace('1', 2);
				}
			},
			{
				transformBundle(code) {
					return Promise.resolve(code.replace('2', 3));
				}
			}
		]
	},
	warnings: [{
		code: 'PLUGIN_WARNING',
		message: 'The transformBundle hook used by plugin at position 1 is deprecated. The renderChunk hook should be used instead.',
		plugin: 'Plugin at position 1',
		pluginCode: 'TRANSFORMBUNDLE_HOOK_DEPRECATED'
	}, {
		code: 'PLUGIN_WARNING',
		message: 'The transformBundle hook used by plugin at position 2 is deprecated. The renderChunk hook should be used instead.',
		plugin: 'Plugin at position 2',
		pluginCode: 'TRANSFORMBUNDLE_HOOK_DEPRECATED'
	}, {
		code: 'PLUGIN_WARNING',
		message: 'The transformBundle hook used by plugin at position 3 is deprecated. The renderChunk hook should be used instead.',
		plugin: 'Plugin at position 3',
		pluginCode: 'TRANSFORMBUNDLE_HOOK_DEPRECATED'
	}]
};
