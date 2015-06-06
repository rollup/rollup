var assert = require( 'assert' );

module.exports = {
	description: 'does not move default export statement above earlier statements',
	exports: function ( exports ) {
		assert.equal( exports.bar, 42 );
	},
	// solo: true
};
