const buble = require('@rollup/plugin-buble');

export default {
	input: 'main.js',
	plugins: [
		buble()
	],
	output: [
		{
			file: '_actual/cjs.js',
			format: 'cjs'
		},
		{
			file: '_actual/es.js',
			format: 'esm'
		}
	]
};
