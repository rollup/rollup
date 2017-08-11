var assert = require( 'assert' );

module.exports = {
	description: 'allows external module to be configured',
	options: {
		external: [ 'path' ]
	},
	exports: function () {
		assert.equal( require( 'path' ).resolve.configured, 'yes' );
	}
};
