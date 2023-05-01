module.exports = defineTest({
	description: "allows to use amd.autoId with amd.basePath and works when concat'd into one file",
	options: {
		input: ['main'],
		output: {
			amd: {
				autoId: true,
				basePath: 'some/where'
			}
		},
		plugins: [
			{
				name: 'concatenate-amd',
				generateBundle(options, bundle) {
					if (options.format === 'amd') {
						const concatenatedCode = Object.keys(bundle)
							.map(chunkName => bundle[chunkName].code)
							.join('\n');
						for (const chunkName of Object.keys(bundle)) {
							delete bundle[chunkName];
						}
						this.emitFile({ type: 'asset', fileName: 'main.js', source: concatenatedCode });
					}
				}
			}
		]
	},
	nestedDir: 'some/where',
	runAmd: {
		exports(exports) {
			return exports.getA();
		}
	}
});
