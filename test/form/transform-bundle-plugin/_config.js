module.exports = {
	description: 'allows plugins to transform bundle',
	options: {
		plugins: [
			{
				transformBundle: function (code) {
					return '/* first plugin */';
				}
			},
			{
				transformBundle: function (code) {
					return code + '\n/* second plugin */';
				}
			}
		]
	}
}
