module.exports = {
	input: 'main.js',
	output: {
		file: '_actual/out.js',
		format: 'es'
	},
	plugins: [
		{
			name: 'before-exit-reporter',
			buildStart() {
				// Only runs for a natural exit, not when process.exit is called.
				process.once('beforeExit', () => console.error('exited naturally'));
			}
		}
	]
};
