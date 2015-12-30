module.exports = {
	description: 'allows plugins to set banner and footer options',
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
