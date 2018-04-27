export default [
	{
		input: 'main.js',
		plugins: [
			{
				resolveId(id) {
					throw new Error('Exception 1');
				}
			}
		],
		output: {
			file: '_actual/bundle1.js',
			format: 'cjs'
		}
	},
	{
		input: 'main.js',
		plugins: [
			{
				resolveId(id) {
					throw new Error('Exception 2');
				}
			}
		],
		output: {
			file: '_actual/bundle2.js',
			format: 'cjs'
		}
	}
];
