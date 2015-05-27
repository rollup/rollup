var path = require( 'path' );
var assert = require( 'assert' );
var Promise = require( 'sander' ).Promise;

module.exports = {
	description: 'uses a custom external path resolver (asynchronous)',
	options: {
		resolveExternal: function ( id, importer, options ) {
			return Promise.resolve( path.resolve( __dirname, 'js_modules', id + '.js' ) );
		}
	},
	exports: function ( exports ) {
		assert.ok( exports.success );
	}
};
