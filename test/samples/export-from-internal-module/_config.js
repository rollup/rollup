var assert = require( 'assert' );

module.exports = {
	description: 'exports from an internal module',
	exports: function ( exports ) {
		assert.equal( exports.foo, 42 );
	}
};
