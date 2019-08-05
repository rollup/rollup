module.exports = {
	description: 'avoid variable from empty module name be empty',
	options: {
		input: '',
		plugins: [
			{
				resolveId (importee) {
					if ( importee==='' ) { return ''; }
				},
				load (path) {
					if ( path==='' ) { return 'export default 0;'; }
				},
			}
		],
		output: {
			format: 'cjs',
			exports: 'default'
		}
	}
};
