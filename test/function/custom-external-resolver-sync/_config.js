var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'uses a custom external path resolver (synchronous)',
	options: {
		resolveExternal: function ( id, importer, options ) {
			return path.resolve( __dirname, 'js_modules', id + '.js' );
		}
	},
	exports: function ( exports ) {
		assert.ok( exports.success );
	}
};
