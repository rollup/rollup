const assert = require( 'assert' );

module.exports = {
	description: 'does not rewrite function expression names incorrectly (#1083)',
	options: {
		external: [ 'path' ]
	},
	exports ( exports ) {
		assert.equal( exports.x.name, 'basename' );
	}
};
