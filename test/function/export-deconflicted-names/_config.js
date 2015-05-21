var assert = require( 'assert' );

module.exports = {
	description: 'correctly exports deconflicted names',
	exports: function ( exports ) {
		assert.equal( exports.bar(), 'bar' );
	}
};
