module.exports = {
	input: 'main.js',
	output: {
		format: 'es'
	},
	plugins: [
		{
			name: 'test',
			buildStart() {
				Promise.resolve().then(() => {
					this.error('LOL');
				});
			}
		}
	]
};
