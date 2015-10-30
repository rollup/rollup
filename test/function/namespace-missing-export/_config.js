var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	options: {
		onwarn: function ( msg ) {
			assert.ok( /Export 'foo' is not defined by/.test( msg ) );
		}
	}
};
