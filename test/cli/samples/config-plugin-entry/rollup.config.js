export default {
	output: {
		format: 'esm'
	},
	plugins: [
		{
			options: opts => {
				opts.input = 'main.js';
			}
		}
	]
};
