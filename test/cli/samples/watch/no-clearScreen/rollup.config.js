export default [
	{
		input: 'main.js',
		output: {
			file: '_actual.js',
			format: 'es',
		},
		watch: {
			clearScreen: true,
		},
	},
	{
		input: 'main.js',
		output: {
			file: '_actual.js',
			format: 'es',
		},
		watch: {
			clearScreen: false,
		},
	},
];
