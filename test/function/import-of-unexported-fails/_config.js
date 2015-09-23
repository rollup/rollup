var assert = require( 'assert' );

module.exports = {
	description: 'marking an imported, but unexported, identifier should throw',
	error: function ( err ) {
		assert.ok( /Module .+empty\.js does not export default \(imported by .+main\.js\)/.test( err.message ) );
	}
};
