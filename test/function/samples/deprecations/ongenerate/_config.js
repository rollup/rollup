module.exports = {
	description: 'marks the ongenerate hook as deprecated',
	options: {
		plugins: {
			ongenerate() {}
		}
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The ongenerate hook used by plugin at position 1 is deprecated. The generateBundle hook should be used instead.',
		plugin: 'at position 1'
	}
};
