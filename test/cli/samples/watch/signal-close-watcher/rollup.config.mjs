export default {
	input: 'main.js',
	output: {
		dir: '_actual',
		format: 'es'
	},
	plugins: [
		{
			name: 'first',
			closeWatcher() {
				console.error('close first');
			}
		},
		{
			name: 'second',
			async closeWatcher() {
				await new Promise(resolve => setTimeout(resolve));
				console.error('close second');
			}
		}
	]
};
