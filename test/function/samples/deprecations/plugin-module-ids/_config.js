module.exports = defineTest({
	description: 'provides all module ids on the plugin context',
	options: {
		external: ['path'],
		plugins: {
			name: 'test',
			renderStart() {
				console.log([...this.moduleIds]);
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'renderStart',
		message:
			'Accessing "this.moduleIds" on the plugin context by plugin test is deprecated. The "this.getModuleIds" plugin context function should be used instead.',
		plugin: 'test',
		pluginCode: 'DEPRECATED_FEATURE',
		url: 'https://rollupjs.org/plugin-development/#this-getmoduleids'
	}
});
