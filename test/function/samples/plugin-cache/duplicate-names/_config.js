module.exports = defineTest({
	description: 'throws if two plugins with the same name and no cache key access the cache',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				buildStart() {
					this.cache.set('asdf', 'asdf');
				}
			},
			{
				name: 'test-plugin',
				buildStart() {
					this.cache.set('asdf', 'asdf');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'The plugin name test-plugin is being used twice in the same build. Plugin names must be distinct or provide a cacheKey (please post an issue to the plugin if you are a plugin user).',
		plugin: 'test-plugin',
		pluginCode: 'DUPLICATE_PLUGIN_NAME'
	}
});
