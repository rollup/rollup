var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	error: function ( err ) {
		assert.equal( path.normalize( err.file ), path.resolve( __dirname, 'empty.js' ) );
		assert.ok( /Export 'foo' is not defined by/.test( err.message ) );
	}
};
