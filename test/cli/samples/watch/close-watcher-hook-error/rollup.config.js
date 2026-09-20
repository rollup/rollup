module.exports = {
	input: 'main.js',
	output: {
		file: '_actual/out.js',
		format: 'es'
	},
	plugins: [
		{
			name: 'failing-close-watcher',
			closeWatcher() {
				throw new Error('close watcher failed');
			}
		}
	]
};
