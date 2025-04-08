const preserveSignature = 'allow-extension';
module.exports = defineTest({
	description: 'merges same exports for modules with allow-extension signature',
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
					this.emitFile({ type: 'chunk', id: 'lib1', preserveSignature });
					this.emitFile({ type: 'chunk', id: 'lib2', preserveSignature });
				}
			}
		]
	}
});
