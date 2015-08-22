var assert = require( 'assert' );

module.exports = {
	description: 'exports are kept up-to-date',
	exports: function ( exports ) {
		assert.equal( exports.count, 0 );
		exports.incr();
		assert.equal( exports.count, 1 );
	},
	// solo: true
};
