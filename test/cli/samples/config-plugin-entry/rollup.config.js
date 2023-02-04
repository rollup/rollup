export default {
	output: {
		format: 'es'
	},
	plugins: [
		{
			options: options => {
				options.input = 'main.js';
			}
		}
	]
};
