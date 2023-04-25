module.exports = defineTest({
	description: 'adds a banner/footer',
	options: {
		output: {
			banner: '/* this is a banner */',
			footer: () => Promise.resolve('/* this is a footer */')
		},
		plugins: [
			{
				name: 'first',
				banner: '/* first banner */',
				footer() {
					return '/* first footer */';
				}
			},
			{
				name: 'second',
				banner() {
					return '/* second banner */';
				},
				footer: '/* second footer */'
			},
			{
				name: 'third',
				banner() {
					return Promise.resolve('/* 3rd banner */');
				},
				footer: '/* 3rd footer */'
			}
		]
	}
});
