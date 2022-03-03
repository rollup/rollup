export default {
	input: 'main.js',
	output: [
		{
			format: 'cjs',
			dir: '_actual',
			entryFileNames: '[name]-[format].js',
			sourcemap: true
		},
		{
			format: 'es',
			dir: '_actual',
			entryFileNames: '[name]-[format].js',
			sourcemap: true
		}
	]
};
