var assert = require( 'assert' );

module.exports = {
	description: 'marking an imported, but unexported, identifier should throw',

	error: function ( err ) {
		assert.equal( err.message.slice( 0, 50 ), 'The imported name "default" is never exported by "' );
		assert.equal( err.message.slice( -10 ), 'empty.js".' );
	}
};
