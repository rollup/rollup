export default {
	input: 'main.js',
	output: [
		{
			format: 'cjs',
			file: '_actual/cjs.js'
		},
		{
			format: 'es',
			file: '_actual/es.js'
		}
	]
};
