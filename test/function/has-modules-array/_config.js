var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'user-facing bundle has modules array',
	bundle: function ( bundle ) {
		assert.ok( bundle.modules );
		assert.deepEqual( bundle.modules, [
			{ id: path.resolve( __dirname, 'foo.js' ) },
			{ id: path.resolve( __dirname, 'main.js' ) }
		]);
	}
};
