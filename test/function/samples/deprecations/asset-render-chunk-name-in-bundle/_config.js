module.exports = defineTest({
	description:
		'marks the "name" property of emitted assets as deprecated in generateBundle when emitted during generate phase',
	options: {
		output: { assetFileNames: '[name][extname]' },
		strictDeprecations: false,
		plugins: {
			name: 'test',
			renderChunk() {
				this.emitFile({
					type: 'asset',
					name: 'test.txt',
					originalFileName: 'test.txt',
					source: 'test'
				});
			},
			generateBundle(options, bundle) {
				console.log(bundle['test.txt'].name);
			}
		}
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'Accessing the "name" property of emitted assets in the bundle is deprecated. Use the "names" property instead.',
			url: 'https://rollupjs.org/plugin-development/#generatebundle'
		}
	]
});
