export default {
	format: 'es',
	plugins: [
		{
			options: opts => {
				opts.input = 'main.js';
			}
		}
	]
};