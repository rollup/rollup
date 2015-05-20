var assert = require( 'assert' );

module.exports = {
	description: 'uses a custom path resolver (synchronous)',
	options: {
		resolvePath: function ( importee, importer ) {
			var Promise = require( 'sander' ).Promise;
			var resolved;

			if ( importee === 'foo' ) {
				resolved = require( 'path' ).resolve( __dirname, 'bar.js' );
			} else {
				resolved = false;
			}

			return Promise.resolve( resolved );
		}
	},
	exports: function ( exports ) {
		assert.strictEqual( exports.path, require( 'path' ) );
	}
};
