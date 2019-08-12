module.exports = {
	description: 'adds a banner/footer',
	options: {
		banner: '/* this is a banner */',
		footer: () => Promise.resolve('/* this is a footer */'),
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
					return Promise.reject(new Error('Could not generate banner.'));
				},
				footer: '/* 3rd footer */'
			}
		]
	},
	generateError: {
		code: 'ADDON_ERROR',
		message:
			'Could not retrieve banner. Check configuration of plugin at position 3.\n\tError Message: Could not generate banner.'
	}
};
