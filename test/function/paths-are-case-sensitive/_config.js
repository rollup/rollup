var assert = require( 'assert' );

module.exports = {
	description: 'insists on correct casing for imports',
	error: function ( err ) {
		assert.ok( /Could not resolve/.test( err.message ) );
	}
};
