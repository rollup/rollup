const preserveSignature = 'allow-extension';
module.exports = defineTest({
	description: 'preserves exports for modules with allow-extension signature',
	options: {
		input: 'main',
		output: {
			manualChunks: {
				libs: ['lib1', 'lib2', 'lib3']
			}
		},
		plugins: [
			{
				name: 'allow-extension-plugin',
				buildStart() {
					this.emitFile({ type: 'chunk', id: 'lib1', preserveSignature });
					this.emitFile({ type: 'chunk', id: 'lib2', preserveSignature });
					this.emitFile({ type: 'chunk', id: 'lib3', preserveSignature });
				}
			}
		]
	}
});
