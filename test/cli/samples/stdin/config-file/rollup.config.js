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
			format: 'es'
		}
	},
	{
		input: 'a.mjs',
		output: {
			file: '_actual/no-stdin.js',
			format: 'es'
		}
	}
];
