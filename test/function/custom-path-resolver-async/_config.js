var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'uses a custom path resolver (asynchronous)',
	options: {
		resolveId: function ( importee, importer ) {
			var Promise = require( 'sander' ).Promise;
			var resolved;

			if ( importee === path.resolve( __dirname, 'main.js' ) ) return importee;

			if ( importee === 'foo' ) {
				resolved = path.resolve( __dirname, 'bar.js' );
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
