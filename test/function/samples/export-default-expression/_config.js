var assert = require( 'assert' );

module.exports = {
	description: 'exports a default value as module.exports',
	exports: function ( exports ) {
		assert.equal( exports, 42 );
	}
};
