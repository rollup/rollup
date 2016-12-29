var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'uses a custom path resolver (synchronous)',
	options: {
		plugins: [{
			resolveId: function ( importee, importer ) {
				if ( path.normalize(importee) === path.resolve( __dirname, 'main.js' ) ) return importee;
				if ( importee === 'foo' ) return path.resolve( __dirname, 'bar.js' );

				return false;
			}
		}]
	},
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			message: `'path' is imported by main.js, but could not be resolved – treating it as an external dependency`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency`
		}
	],
	exports: function ( exports ) {
		assert.strictEqual( exports.path, require( 'path' ) );
	}
};
