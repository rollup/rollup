module.exports = {
	description: 'allows globals to be specified as a function',
	options: {
		external: [ 'a-b-c' ],
		globals: function ( id ) {
			return id.replace( /-/g, '_' );
		}
	}
};
