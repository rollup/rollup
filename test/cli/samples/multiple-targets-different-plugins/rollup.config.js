import { terser } from 'rollup-plugin-terser';

export default {
	input: 'main.js',
	output: [
		{
			format: 'cjs',
			file: '_actual/main.js'
		},
		{
			format: 'cjs',
			file: '_actual/minified.js',
			plugins: [terser()]
		}
	]
};
