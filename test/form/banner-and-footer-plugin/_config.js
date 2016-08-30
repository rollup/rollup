module.exports = {
	description: 'allows plugins to set banner and footer options',
	options: {
		plugins: [
			{
				banner: '/* first banner */',
				footer: function () { return '/* first footer */'; }
			},
			{
				banner: function () { return '/* second banner */'; },
				footer: '/* second footer */'
			}
		]
	}
};
