module.exports = {
	description: 'adds a banner/footer',
	options: {
		output: {
			banner: '/* this is a banner */',
			footer: () => Promise.resolve('/* this is a footer */')
		},
		plugins: [
			{
				banner: '/* first banner */',
				footer: function() {
					return '/* first footer */';
				}
			},
			{
				banner: function() {
					return '/* second banner */';
				},
				footer: '/* second footer */'
			},
			{
				banner: function() {
					return Promise.resolve('/* 3rd banner */');
				},
				footer: '/* 3rd footer */'
			}
		]
	}
};
