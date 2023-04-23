module.exports = defineTest({
	description: 'It is not necessary to provide an input if a dynamic entry is emitted',
	options: {
		input: undefined,
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({ type: 'chunk', id: 'chunk.js' });
			}
		}
	}
});
