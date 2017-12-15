module.exports = {
	description: 'adds a banner/footer',
	options: {
		banner: '/* this is a banner */',
		footer: () => Promise.resolve('/* this is a footer */'),
		plugins: [
			{
				banner: '/* first banner */',
				footer: function () { return '/* first footer */'; }
			},
			{
				banner: function () { return '/* second banner */'; },
				footer: '/* second footer */'
			},
			{
				banner: function () { return Promise.reject(new Error('Could not generate banner.')); },
				footer: '/* 3rd footer */'
			}
		]
	},
	generateError: {
		code: 'ADDON_ERROR',
		message: 'Could not retrieve banner. Check configuration of Plugin at pos 2.\n\tError Message: Could not generate banner.'
	}
};
