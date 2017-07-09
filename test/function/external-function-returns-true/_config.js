module.exports = {
	description: 'allows external option to be a function (#522)',
	options: {
		external: id => true
	},
	context: {
		require: id => {
			if ( id === 'external' ) return 42;
			return require( id );
		}
	}
};
