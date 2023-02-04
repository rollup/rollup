export default [
	{
		input: 'main.js',
		output: {
			file: '_actual/bundle1.js',
			format: 'cjs',
			exports: 'auto'
		}
	},
	{
		input: 'main.js',
		plugins: [
			{
				resolveId(id) {
					throw new Error('Unexpected Exception');
				}
			}
		],
		output: {
			file: '_actual/bundle2.js',
			format: 'cjs',
			exports: 'auto'
		}
	}
];
