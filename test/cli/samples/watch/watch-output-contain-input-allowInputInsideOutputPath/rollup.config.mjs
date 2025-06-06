export default [
	{
		input: {'out': 'output/main.js'},
		watch: {
			allowInputInsideOutputPath: true,
		},
		output: {
			dir: 'output',
			format: 'es'
		}
	},
];
