export default {
	input: 'main.js',
	sourcemap: true,
	targets: [
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
