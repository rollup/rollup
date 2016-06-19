export default {
	entry: 'main.js',
	targets: [
		{
			format: 'cjs',
			dest: '_actual/cjs.js'
		},
		{
			format: 'es',
			dest: '_actual/es.js'
		}
	]
};
