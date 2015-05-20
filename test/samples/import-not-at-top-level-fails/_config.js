var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'disallows non-top-level imports',
	error: function ( err ) {
		assert.equal( err.file, path.resolve( __dirname, 'main.js' ) );
		assert.deepEqual( err.loc, { line: 2, column: 2 });
		assert.ok( /may only appear at the top level/.test( err.message ) );
	}
};
