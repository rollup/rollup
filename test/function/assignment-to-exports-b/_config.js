const assert = require( 'assert' );

module.exports = {
	description: 'exports are kept up-to-date',
	exports: exports => {
		assert.equal( exports.b, 42 );
	}
};
