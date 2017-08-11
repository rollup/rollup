const assert = require( 'assert' );

module.exports = {
	description: 'exports are rewritten inside a variable init',
	exports: exports => {
		assert.equal( exports.b, 42 );
	}
};
