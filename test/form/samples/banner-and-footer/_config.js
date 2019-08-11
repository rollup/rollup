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
				footer() {
					return '/* first footer */';
				}
			},
			{
				banner() {
					return '/* second banner */';
				},
				footer: '/* second footer */'
			},
			{
				banner() {
					return Promise.resolve('/* 3rd banner */');
				},
				footer: '/* 3rd footer */'
			}
		]
	}
};
