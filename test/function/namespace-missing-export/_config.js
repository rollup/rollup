var assert = require( 'assert' );

module.exports = {
	solo: true,

	error: function ( err ) {
		console.log( err.message );
		// assert.equal( path.normalize(err.file), path.resolve( __dirname, 'main.js' ) );
		// assert.deepEqual( err.loc, { line: 8, column: 0 });
		assert.ok( /Export "foo" is not defined by/.test( err.message ) );
	}
};
