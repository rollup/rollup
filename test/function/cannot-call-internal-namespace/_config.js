var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'errors if code calls an internal namespace',
	error: function ( err ) {
		assert.equal( err.message, 'Cannot call a namespace (\'foo\')' );
		assert.equal( err.file, path.resolve( __dirname, 'main.js' ).replace( /\//g, path.sep ) );
		assert.equal( err.pos, 33 );
		assert.deepEqual( err.loc, { line: 2, column: 0 });
	}
};
