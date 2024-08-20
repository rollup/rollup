export default {
	input: 'main.js',
	output: {
		dir: '_actual',
		format: 'es'
	},
	plugins: [
		{
			name: 'first',
			generateBundle() {
				process.exit(1);
			},
			closeWatcher() {
				console.error('close watcher');
			}
		},
	]
};
