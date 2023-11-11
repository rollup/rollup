module.exports = {
	input: 'main.js',
	onwarn(warning) {
		throw new Error(`Unexpected warning: ${warning.message}`);
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
