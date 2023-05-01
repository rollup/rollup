module.exports = defineTest({
	description: 'supports implicit dependencies when emitting files',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: ['main.js'],
					preserveSignature: 'strict'
				});
			}
		}
	}
});
