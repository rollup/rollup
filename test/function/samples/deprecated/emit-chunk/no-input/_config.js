module.exports = {
	description: 'It is not necessary to provide an input if a dynamic entry is emitted',
	options: {
		strictDeprecations: false,
		input: undefined,
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitChunk('chunk.js');
			}
		}
	}
};
