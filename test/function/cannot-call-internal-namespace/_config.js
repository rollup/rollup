var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'errors if code calls an internal namespace',
	error: function ( err ) {
		assert.equal( err.message, 'Cannot call a namespace (\'foo\')' );
		assert.equal( err.file.replace( /\//g, path.sep ), path.resolve( __dirname, 'main.js' ) );
		assert.equal( err.pos, 33 );
		assert.deepEqual( err.loc, { character: 33, line: 2, column: 0 });
	}
};
