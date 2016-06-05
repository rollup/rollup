var assert = require( 'assert' );

module.exports = {
	description: 'removes empty exported var declarations',
	exports: function ( exports ) {
		assert.equal( exports.foo, 42 );
	}
};
