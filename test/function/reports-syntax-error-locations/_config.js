var assert = require( 'assert' );

module.exports = {
	description: 'reports syntax error filename',
	error: function ( err ) {
		assert.ok( /in .+main\.js/.test( err.message ) );
	}
};
