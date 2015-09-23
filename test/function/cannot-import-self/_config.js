var assert = require( 'assert' );

module.exports = {
	description: 'prevents a module importing itself',
	error: function ( err ) {
		assert.ok( /A module cannot import itself/.test( err.message ) );
	}
};
