const FOO = {};

module.exports = {
	description: 'allows resolveId to return a non-string',
	options: {
		plugins: [{
			resolveId: importee => {
				if ( importee === 'foo' ) return FOO;
			},
			load: id => {
				if ( id === FOO ) return 'export default 42';
			}
		}]
	}
};
