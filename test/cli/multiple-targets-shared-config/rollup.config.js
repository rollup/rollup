export default {
	entry: 'main.js',
	sourceMap: true,
	targets: [
		{
			format: 'cjs',
			dest: '_actual/cjs.js'
		},
		{
			format: 'es6',
			dest: '_actual/es6.js'
		}
	]
};
