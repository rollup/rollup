var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	description: 'includes a relative external module only once (nested version)',
	options: {
		external: path.join( __dirname, './first/foo.js' )
	},
	context: {
		require: function ( required ) {
			assert.equal( required, './first/foo.js' );
			return 1;
		}
	},
	exports: function ( exports ) {
		assert.equal( exports, 3 );
	}
};
