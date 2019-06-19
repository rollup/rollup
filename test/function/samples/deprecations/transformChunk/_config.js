module.exports = {
	description: 'marks the transformChunk hook as deprecated',
	options: {
		plugins: {
			transformChunk() {
				return '';
			}
		}
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The transformChunk hook used by plugin at position 1 is deprecated. The renderChunk hook should be used instead.',
		plugin: 'at position 1'
	}
};
