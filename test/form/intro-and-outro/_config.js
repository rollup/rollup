module.exports = {
	description: 'adds an intro/outro',
	options: {
		intro: '/* this is an intro */',
		outro: '/* this is an outro */',
		moduleName: 'foo',
		external: [ 'external' ],
		plugins: [
			{
				intro () {
					return '// intro 1'
				},
				outro () {
					return '// outro 1'
				}
			},

			{
				intro () {
					return '// intro 2'
				},
				outro () {
					return '// outro 2'
				}
			}
		]
	}
};
