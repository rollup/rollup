module.exports = {
	description: 'avoid variable from empty module name be empty',
	options: {
		input: '',
		plugins: [
			{
				resolveId() {
					return '';
				},
				load() {
					return 'export default 0;';
				}
			}
		],
		output: {
			format: 'cjs'
		}
	}
};
