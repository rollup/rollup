var assert = require( 'assert' );

module.exports = {
	description: 'does not rename functions that are exported and reassigned (#438)',
	exports: function ( exports ) {
		assert.equal( exports.number, 0 );
		assert.equal( exports.increment(), 1 );
		assert.equal( exports.number, 1 );

		assert.ok( !( 'incr' in exports ) );
	}
};
