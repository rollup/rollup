module.exports = {
	description: 'allows plugins to transform bundle',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				transformBundle(code) {
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
