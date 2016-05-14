var assert = require( 'assert' );

module.exports = {
	description: 'renames variables named `exports` if necessary',
	exports: function ( exports ) {
		assert.deepEqual( Object.keys( exports ), [ 'a', 'b', '__esModule' ] );
		assert.equal( exports.a, 'A' );
		assert.equal( exports.b, 42 );
	}
};
