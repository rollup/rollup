require( 'source-map-support' ).install();
require( 'console-group' ).install();

var path = require( 'path' );
var sander = require( 'sander' );
var assert = require( 'assert' );
var rollup = require( '../dist/rollup' );

var SAMPLES = path.resolve( __dirname, 'samples' );

function extend ( target ) {
	[].slice.call( arguments, 1 ).forEach( function ( source ) {
		source && Object.keys( source ).forEach( function ( key ) {
			target[ key ] = source[ key ];
		});
	});

	return target;
}

describe( 'rollup', function () {
	it( 'exists', function () {
		assert.ok( !!rollup );
	});

	it( 'has a rollup method', function () {
		assert.equal( typeof rollup.rollup, 'function' );;
	});

	sander.readdirSync( SAMPLES ).sort().forEach( function ( dir ) {
		if ( dir[0] === '.' ) return; // .DS_Store...

		var config;

		try {
			config = require( SAMPLES + '/' + dir + '/_config' );
		} catch ( err ) {
			config = { description: dir };
		}

		( config.solo ? it.only : it )( dir, function () {
			return rollup.rollup( SAMPLES + '/' + dir + '/main.js', extend( {}, config.options ) )
				.then( function ( bundle ) {
					var unintendedError;

					if ( config.error ) {
						throw new Error( 'Expected an error while rolling up' );
					}

					// try to generate output
					try {
						var result = bundle.generate( extend( {}, config.bundleOptions, {
							format: 'cjs'
						}));

						if ( config.error ) {
							unintendedError = new Error( 'Expected an error while generating output' );
						}
					} catch ( err ) {
						if ( config.error ) {
							config.error( err );
						} else {
							unintendedError = err;
						}
					}

					if ( unintendedError ) throw unintendedError;


					try {
						var fn = new Function( 'require', 'module', 'exports', 'assert', result.code );
						var module = {
							exports: {}
						};
						fn( require, module, module.exports, assert );

						if ( config.error ) {
							unintendedError = new Error( 'Expected an error while executing output' );
						}

						if ( config.exports ) {
							config.exports( module.exports );
						}
					} catch ( err ) {
						if ( config.error ) {
							config.error( err );
						} else {
							unintendedError = err;
						}
					}

					if ( unintendedError ) throw unintendedError;

					if ( config.show ) {
						console.log( result.code + '\n\n\n' );
					}
				}, function ( err ) {
					if ( config.error ) {
						config.error( err );
					} else {
						throw err;
					}
				});
		});
	});
});
