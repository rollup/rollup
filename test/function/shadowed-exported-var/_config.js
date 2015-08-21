var assert = require( 'assert' );

module.exports = {
	description: 'handles shadowed exported variable',
	exports: function ( exports ) {
		assert.equal( exports.foo(), 42 );
	},
	// solo: true
};
