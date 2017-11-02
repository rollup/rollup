var assert = require( 'assert' );

module.exports = {
	description: 'Associates function return values with regard to mutations',
	exports: function ( exports ) {
		assert.equal( exports.bar, 'present' );
	}
};
