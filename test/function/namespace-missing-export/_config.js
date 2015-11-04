var assert = require( 'assert' );

module.exports = {
	options: {
		onwarn: function ( msg ) {
			assert.ok( /Export 'foo' is not defined by/.test( msg ) );
		}
	}
};
