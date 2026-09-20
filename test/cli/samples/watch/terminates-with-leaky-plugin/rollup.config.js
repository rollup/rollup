module.exports = {
	input: 'main.js',
	output: {
		file: '_actual/out.js',
		format: 'es'
	},
	plugins: [
		{
			name: 'leaky',
			buildStart() {
				// Deliberately left running to keep the process alive.
				setInterval(() => {}, 1000);
			}
		}
	]
};
