module.exports = defineTest({
	description:
		'marks the "originalFileName" property of emitted assets as deprecated in generateBundle',
	options: {
		output: { assetFileNames: '[name][extname]' },
		strictDeprecations: true,
		plugins: {
			name: 'test',
			buildStart() {
				this.emitFile({
					type: 'asset',
					name: 'test.txt',
					originalFileName: 'test.txt',
					source: 'test'
				});
			},
			generateBundle(options, bundle) {
				console.log(bundle['test.txt'].originalFileName);
			}
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'generateBundle',
		message:
			'Accessing the "originalFileName" property of emitted assets in the bundle is deprecated. Use the "originalFileNames" property instead.',
		plugin: 'test',
		pluginCode: 'DEPRECATED_FEATURE',
		url: 'https://rollupjs.org/plugin-development/#generatebundle'
	}
});
