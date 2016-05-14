var assert = require( 'assert' );

module.exports = {
	description: 'handle destruction patterns in export declarations',
	babel: true,

	exports: function ( exports ) {
		assert.deepEqual( Object.keys( exports ), [ 'baz', 'quux', '__esModule' ] );
		assert.equal( exports.baz, 5 );
		assert.equal( exports.quux, 17 );
	}
};
