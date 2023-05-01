module.exports = defineTest({
	description: 'handles shared dependencies between implicit chunks without side-effects',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'core.js',
					implicitlyLoadedAfterOneOf: ['main']
				});
				this.emitFile({
					type: 'chunk',
					id: 'button.js',
					implicitlyLoadedAfterOneOf: ['main']
				});
			}
		}
	}
});
