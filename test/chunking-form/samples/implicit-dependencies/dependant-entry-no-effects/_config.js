module.exports = defineTest({
	description: 'properly emits a chunk when it is implicitly loaded after an empty entry module',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'dep.js',
					implicitlyLoadedAfterOneOf: ['main']
				});
			}
		}
	}
});
