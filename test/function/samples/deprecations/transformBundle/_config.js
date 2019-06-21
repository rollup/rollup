module.exports = {
	description: 'marks the transformBundle hook as deprecated',
	options: {
		plugins: {
			transformBundle() {
				return '';
			}
		}
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "transformBundle" hook used by plugin at position 1 is deprecated. The "renderChunk" hook should be used instead.',
		plugin: 'at position 1'
	}
};
