export default [
	{
		input: 'b.mjs',
		output: {
			file: '_actual/cjs.js',
			format: 'cjs'
		}
	},
	{
		input: 'a.mjs',
		output: {
			file: '_actual/esm.js',
			format: 'esm'
		}
	}
];
