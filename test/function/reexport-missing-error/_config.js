var assert = require( 'assert' );

module.exports = {
	description: 'reexporting a missing identifier should print an error',
	error: function ( error ) {
		assert.ok( /^'foo' is not exported/.test( error.message ) );
	}
};
