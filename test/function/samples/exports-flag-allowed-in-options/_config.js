var assert = require( 'assert' );

module.exports = {
	description: 'exports flag is passed through to bundle options',
	options: {
		output: { exports: 'named' }
	},
	exports: function ( exports ) {
		assert.equal( exports.y, 42 );
		assert.ok( !( 'x' in exports ) );
	}
};
