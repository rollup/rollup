var assert = require( 'assert' );

module.exports = {
	description: 'uses a custom path resolver (synchronous)',
	options: {
		resolvePath: function ( importee, importer ) {
			if ( importee === 'foo' ) {
				return require( 'path' ).resolve( __dirname, 'bar.js' );
			}

			return false;
		}
	},
	exports: function ( exports ) {
		assert.strictEqual( exports.path, require( 'path' ) );
	}
};
