module.exports = defineTest({
	description: 'Allows overriding behaviour for emitted chunks',
	options: {
		input: [],
		preserveEntrySignatures: 'allow-extension',
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'strict/main.js',
					name: 'strict',
					preserveSignature: 'strict'
				});
				this.emitFile({
					type: 'chunk',
					id: 'allow-extension/main.js',
					name: 'allow-extension',
					preserveSignature: 'allow-extension'
				});
				this.emitFile({
					type: 'chunk',
					id: 'false/main.js',
					name: 'false',
					preserveSignature: false
				});
				this.emitFile({
					type: 'chunk',
					id: 'not-specified/main.js',
					name: 'not-specified'
				});
			}
		}
	}
});
