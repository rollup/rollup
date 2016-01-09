var assert = require( 'assert' );

module.exports = {
	description: 'does not wrongly append comments',
	exports: function ( exports ) {
		assert.equal( exports, 42 );
	}
};
