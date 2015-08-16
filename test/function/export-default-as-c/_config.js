var assert = require( 'assert' );

module.exports = {
	description: 'exports default-as-named from sibling module (c)',
	exports: function ( exports ) {
		assert.equal( exports.namespace.baz, 'BAZ' );
	}
};
