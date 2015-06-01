var assert = require( 'assert' );

module.exports = {
	description: 'exports a default named function',
	exports: function ( exports ) {
		assert.equal( exports(), 42 );
	}
};
