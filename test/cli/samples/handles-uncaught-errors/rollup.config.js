module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		{
			name: 'test',
			buildStart() {
				Promise.resolve().then(() => {
					throw new TypeError('foo');
				});
			}
		}
	]
};
