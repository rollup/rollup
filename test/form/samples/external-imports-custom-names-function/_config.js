module.exports = {
	description: 'allows globals to be specified as a function',
	options: {
		output: {
			globals: function ( id ) {
				return id.replace( /-/g, '_' );
			}
		}
	}
};
