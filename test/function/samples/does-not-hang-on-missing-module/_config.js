var assert = require( 'assert' );

module.exports = {
	description: 'does not hang on missing module (#53)',
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			source: 'unlessYouCreatedThisFileForSomeReason',
			message: `'unlessYouCreatedThisFileForSomeReason' is imported by main.js, but could not be resolved – treating it as an external dependency`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency`
		}
	],
	runtimeError: function ( error ) {
		assert.equal( "Cannot find module 'unlessYouCreatedThisFileForSomeReason'", error.message );
	}
};
