export default {
	format: 'es',
	plugins: [
		{
			options: opts => {
				opts.entry = 'main.js';
			}
		}
	]
};