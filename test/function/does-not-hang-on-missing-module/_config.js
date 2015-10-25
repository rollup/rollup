var assert = require( 'assert' );

module.exports = {
	description: 'does not hang on missing module (#53)',
	options: {
		onwarn: function ( msg ) {
			assert.equal( "Treating 'unlessYouCreatedThisFileForSomeReason' as external dependency", msg );
		}
	},
	runtimeError: function ( error ) {
		assert.equal( "Cannot find module 'unlessYouCreatedThisFileForSomeReason'", error.message );
	}
};
