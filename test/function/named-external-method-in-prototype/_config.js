module.exports = {
	description: 'method of external named import used inside prototype method',
	context: {
		// override require here, making "foo" appear as a global module
		require: function ( name ) {
			if ( name === 'bar' ) {
				return require( './bar' );
			}
			return require( name );
		}
	},
	options: {
		external: [ 'bar' ]
	},
};
