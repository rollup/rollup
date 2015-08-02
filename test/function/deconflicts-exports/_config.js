var assert = require( 'assert' );

module.exports = {
	description: 'renames variables named `exports` if necessary',
	exports: function ( exports ) {
		assert.deepEqual( Object.keys( exports ), [ 'a', 'b' ] );
		assert.equal( exports.a, 'A' );
		assert.equal( exports.b, 42 );
	},
	solo: true,
	show: true
};
