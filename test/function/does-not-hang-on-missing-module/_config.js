var assert = require( 'assert' );

module.exports = {
	description: 'does not hang on missing module (#53)',
	error: function ( error ) {
		assert.ok( /Could not find package unlessYouCreatedThisFileForSomeReason/.test( error.message ) );
	}
};
