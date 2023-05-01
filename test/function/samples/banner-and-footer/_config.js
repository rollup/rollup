module.exports = defineTest({
	description: 'adds a banner/footer',
	options: {
		output: {
			banner: '/* this is a banner */',
			footer: () => Promise.resolve('/* this is a footer */')
		},
		plugins: [
			{
				name: 'test-plugin1',
				banner: '/* first banner */',
				footer() {
					return '/* first footer */';
				}
			},
			{
				name: 'test-plugin2',
				banner() {
					return '/* second banner */';
				},
				footer: '/* second footer */'
			},
			{
				name: 'test-plugin3',
				banner() {
					return Promise.reject(new Error('Could not generate banner.'));
				},
				footer: '/* 3rd footer */'
			}
		]
	},
	generateError: {
		code: 'ADDON_ERROR',
		message:
			'Could not retrieve "banner". Check configuration of plugin "test-plugin3".\n' +
			'\tError Message: Could not generate banner.'
	}
});
