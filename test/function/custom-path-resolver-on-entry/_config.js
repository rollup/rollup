var path = require( 'path' );
var fs = require( 'fs' );
var assert = require( 'assert' );

var cachedModules = {
	'@main.js': 'import foo from "./foo"; export default foo();'
};

module.exports = {
	description: 'applies custom resolver to entry point',
	//solo: true,
	options: {
		plugins: [{
			resolveId: function ( importee, importer ) {
				if ( importer === undefined ) {
					return '@' + path.relative( __dirname, importee );
				}

				if ( importer[0] === '@' ) {
					return path.resolve( __dirname, importee ) + '.js';
				}
			},
			load: function ( moduleId ) {
				if ( moduleId[0] === '@' ) {
					return cachedModules[ moduleId ];
				}

				return fs.readFileSync( moduleId, 'utf-8' );
			}
		}]
	},
	exports: function ( exports ) {
		assert.equal( exports, 42 );
	}
};
