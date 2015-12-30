module.exports = {
	description: 'allows plugins to transform bundle',
	options: {
		plugins: [
			{
				transformBundle: function (result) {
					return {
						code: '/* first plugin */'
					};
				}
			},
			{
				transformBundle: function (result) {
					return {
						code: result.code + '\n/* second plugin */'
					};
				}
			}
		]
	}
}
