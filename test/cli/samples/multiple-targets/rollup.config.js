export default {
	input: 'main.js',
	targets: [
		{
			format: 'cjs',
			output: '_actual/cjs.js'
		},
		{
			format: 'es',
			output: '_actual/es.js'
		}
	]
};
