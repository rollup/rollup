export default [
	{
		input: 'main.js',
		watch: false,
		output: {
			dir: '_actual/es',
			format: 'es'
		}
	},
	{
		input: 'main.js',
		watch: false,
		output: {
			dir: '_actual/cjs',
			format: 'cjs'
		}
	}
];
