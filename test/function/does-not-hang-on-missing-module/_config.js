var assert = require( 'assert' );

module.exports = {
	description: 'does not hang on missing module (#53)',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			`'unlessYouCreatedThisFileForSomeReason' is imported by main.js, but could not be resolved – treating it as an external dependency. For help see https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency`
		]);
	},
	runtimeError: function ( error ) {
		assert.equal( "Cannot find module 'unlessYouCreatedThisFileForSomeReason'", error.message );
	}
};
