module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		{
			name: 'open-handles',
			buildStart() {
				setInterval(() => {
					// hang forever
				}, 2 ** 24);
			}
		}
	]
};
