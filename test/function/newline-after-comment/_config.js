var assert = require( 'assert' );

module.exports = {
	description: 'inserts newline after comment',
	exports: function ( exports ) {
		assert.equal( exports(), 42 );
	}
	// solo: true
};
