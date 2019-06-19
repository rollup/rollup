module.exports = {
	description: 'marks the resolveAssetUrl hook as deprecated',
	options: {
		plugins: {
			resolveAssetUrl() {}
		}
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'The "resolveAssetUrl" hook used by plugin at position 1 is deprecated. The "resolveFileUrl" hook should be used instead.',
		plugin: 'at position 1'
	}
};
