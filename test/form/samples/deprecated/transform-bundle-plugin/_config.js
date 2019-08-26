module.exports = {
	description: 'allows plugins to transform bundle',
	expectedWarnings: ['DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		plugins: [
			{
				transformBundle() {
					return '/* first plugin */';
				}
			},
			{
				transformBundle(code) {
					return code + '\n/* second plugin */';
				}
			}
		]
	}
};
