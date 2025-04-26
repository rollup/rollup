const preserveSignature = 'allow-extension';
module.exports = defineTest({
	description: 'generate the separate chunk for the entry module with explicated file name',
	options: {
		input: 'main',
		output: {
			manualChunks: {
				libs: ['lib1', 'lib2']
			}
		},
		plugins: [
			{
				name: 'allow-extension-plugin',
				buildStart() {
					this.emitFile({ type: 'chunk', id: 'lib1', fileName: 'lib1.js', preserveSignature });
					this.emitFile({ type: 'chunk', id: 'lib2', fileName: 'lib2.js', preserveSignature });
				}
			}
		]
	}
});
