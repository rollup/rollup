var assert = require( 'assert' );
var path = require( 'path' );

module.exports = {
	description: 'includes a relative external module only once (from upper directory too)',
	options: {
		entry: path.join( __dirname, 'first', 'main.js' ),
		external: path.join( __dirname, './foo.js' )
	},
	context: {
		require: function ( required ) {
			assert.equal( required, '../foo.js' );
			return 1;
		}
	},
	exports: function ( exports ) {
		assert.equal( exports, 3 );
	}
};
