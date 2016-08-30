var assert = require( 'assert' );

module.exports = {
	description: 'missing relative imports are an error, not a warning',
	error: function ( err ) {
		assert.ok( /Could not resolve '\.\/missing\.js' from/.test( err.message ) );
	}
};
