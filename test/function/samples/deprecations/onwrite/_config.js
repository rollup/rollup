module.exports = {
	description: 'marks the onwrite hook as deprecated',
	options: {
		plugins: {
			onwrite() {}
		}
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "onwrite" hook used by plugin at position 1 is deprecated. The "generateBundle/writeBundle" hook should be used instead.',
		plugin: 'at position 1'
	}
};
