var assert = require( 'assert' );

module.exports = {
	description: 'exports named values from the bundle entry module',
	exports: function ( exports ) {
		assert.equal( exports.answer, 42 );
	}
};
