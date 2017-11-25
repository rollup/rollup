export default {
	output: {
		format: 'es'
	},
	plugins: [
		{
			options: opts => {
				opts.input = 'main.js';
			}
		}
	]
};
