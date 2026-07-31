module.exports = defineTest({
	description:
		'throws when the deprecated importerAttributes option of this.resolve is used within the resolveId hook and strictDeprecations is enabled',
	options: {
		plugins: [
			{
				name: 'caller',
				async buildStart() {
					await this.resolve('trigger');
				}
			},
			{
				name: 'nested-caller',
				async resolveId(source) {
					if (source === 'trigger') {
						await this.resolve('legacy-target', 'importer', {
							importerAttributes: { type: 'legacy' }
						});
					}
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		plugin: 'caller',
		pluginCode: 'DEPRECATED_FEATURE',
		message:
			'[plugin nested-caller] The "importerAttributes" option is deprecated. Provide a UniqueModuleId for "importer" instead.',
		url: 'https://rollupjs.org/plugin-development/#this-resolve'
	}
});
