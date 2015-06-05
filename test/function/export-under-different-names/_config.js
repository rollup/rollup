var assert = require( 'assert' );

module.exports = {
	description: 'exports bindings under multiple names',
	exports: function ( exports ) {
		assert.strictEqual( exports.foo, exports.bar );
		assert.ok( exports.foo.isFoo );
	},
	solo: true
};
