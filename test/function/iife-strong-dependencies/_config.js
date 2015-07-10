var assert = require( 'assert' );

module.exports = {
	description: 'does not treat references inside IIFEs as weak dependencies', // edge case encountered in THREE.js codebase
	exports: function ( exports ) {
		assert.ok( exports.a1.isA );
		assert.ok( exports.b1.isB );
		assert.ok( exports.c1.isC );
		assert.ok( exports.d1.isD );
		assert.ok( exports.a2.isA );
		assert.ok( exports.b2.isB );
		assert.ok( exports.c2.isC );
		assert.ok( exports.d2.isD );
	}
};
