export default [
	{
		input: '-',
		output: {
			file: '_actual/cjs.js',
			format: 'cjs'
		}
	},
	{
		input: '-',
		output: {
			file: '_actual/es.js',
			format: 'esm'
		}
	},
	{
		input: 'a.mjs',
		output: {
			file: '_actual/no-stdin.js',
			format: 'esm'
		}
	}
];
