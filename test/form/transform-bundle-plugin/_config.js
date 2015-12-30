module.exports = {
	description: 'allows plugins to transform bundle',
	options: {
		plugins: [
			{
				transformBundle: function (result) {
					return '/* first plugin */';
				}
			},
			{
				transformBundle: function (result) {
					return result.code + '\n/* second plugin */';
				}
			}
		]
	}
}
