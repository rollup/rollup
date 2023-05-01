module.exports = defineTest({
	description: 'avoid variable from empty module name be empty',
	options: {
		input: '',
		plugins: [
			{
				name: 'test-plugin',
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
});
