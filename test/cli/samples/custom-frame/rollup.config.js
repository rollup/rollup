module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		{
			transform() {
				const err = new Error('My error.');
				err.frame = 'custom code frame';
				this.error(err);
			}
		}
	]
};
