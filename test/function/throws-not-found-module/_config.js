var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	solo: true,
	description: 'throws error if module is not found',
	error: function ( err ) {
		assert.equal( err.message, 'Could not resolve \'./mod\' from ' + path.resolve( __dirname, 'main.js' ) );
	}
};