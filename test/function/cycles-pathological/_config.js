var assert = require( 'assert' );

module.exports = {
	description: 'resolves pathological cyclical dependencies gracefully',
	babel: true,
	exports: function ( exports ) {
		assert.ok( exports.a.isA );
		assert.ok( exports.b1.isA );
		assert.ok( exports.b1.isB );
		assert.ok( exports.b2.isA );
		assert.ok( exports.b2.isB );
		assert.ok( exports.c1.isC );
		assert.ok( exports.c1.isD );
		assert.ok( exports.c2.isC );
		assert.ok( exports.c2.isD );
		assert.ok( exports.d.isD );
	},
	solo: true
};
