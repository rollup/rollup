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
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "this.emitChunk" plugin context function used by plugin test-plugin is deprecated. The "this.emitFile" plugin context function should be used instead.',
			plugin: 'test-plugin'
		}
	]
};
