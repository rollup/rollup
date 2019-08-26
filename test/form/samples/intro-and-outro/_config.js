module.exports = {
	description: 'adds an intro/outro',
	options: {
		output: {
			globals: { external: 'a' },
			intro: '/* this is an intro */',
			outro: '/* this is an outro */',
			name: 'foo'
		},
		external: ['external'],
		plugins: [
			{
				intro() {
					return '// intro 1';
				},
				outro() {
					return '// outro 1';
				}
			},
			{
				intro() {
					return '// intro 2';
				},
				outro() {
					return Promise.resolve('// outro 2');
				}
			},
			{
				intro() {
					return Promise.resolve('// intro 3');
				},
				outro() {
					return '// outro 3';
				}
			},
			{
				intro: '// intro 4',
				outro: '// outro 4'
			}
		]
	}
};
