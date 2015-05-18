module.exports = {
	description: 'exports from an internal module',
	exports: function ( exports, assert ) {
		assert.equal( exports.foo, 42 );
	},
	solo: true
};