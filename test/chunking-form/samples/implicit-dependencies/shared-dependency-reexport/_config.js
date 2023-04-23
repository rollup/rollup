module.exports = defineTest({
	description: 'handles shared dependencies when there are only reexports',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'implicit.js',
					implicitlyLoadedAfterOneOf: ['main']
				});
			}
		}
	}
});
