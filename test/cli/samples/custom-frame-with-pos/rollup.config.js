module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		{
			transform() {
				const error = new Error('My error.');
				error.frame = 'custom code frame';
				this.error(error, {
					line: 1,
					column: 5
				});
			}
		}
	]
};
