var assert = require( 'assert' );

module.exports = {
	description: 'Associates getter return values with regard to calls',
	exports: function ( exports ) {
		assert.equal( exports.bar, 'present' );
	}
};
