require( 'source-map-support' ).install();
require( 'console-group' ).install();

var path = require( 'path' );
var sander = require( 'sander' );
var assert = require( 'assert' );
var babel = require( 'babel-core' );
var sequence = require( './utils/promiseSequence' );
var rollup = require( '../dist/rollup' );

var FUNCTION = path.resolve( __dirname, 'function' );
var FORM = path.resolve( __dirname, 'form' );

function extend ( target ) {
	[].slice.call( arguments, 1 ).forEach( function ( source ) {
		source && Object.keys( source ).forEach( function ( key ) {
			target[ key ] = source[ key ];
		});
	});

	return target;
}

describe( 'rollup', function () {
	describe( 'sanity checks', function () {
		it( 'exists', function () {
			assert.ok( !!rollup );
		});

		it( 'has a rollup method', function () {
			assert.equal( typeof rollup.rollup, 'function' );
		});
	});

	describe( 'function', function () {
		sander.readdirSync( FUNCTION ).sort().forEach( function ( dir ) {
			if ( dir[0] === '.' ) return; // .DS_Store...

			var config;

			try {
				config = require( FUNCTION + '/' + dir + '/_config' );
			} catch ( err ) {
				config = { description: dir };
			}

			( config.skip ? it.skip : config.solo ? it.only : it )( dir, function () {
				return rollup.rollup( FUNCTION + '/' + dir + '/main.js', extend( {}, config.options ) )
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

						var code;

						try {
							if ( config.babel ) {
								code = babel.transform( code, {
									whitelist: config.babel
								}).code;
							} else {
								code = result.code;
							}

							var fn = new Function( 'require', 'module', 'exports', 'assert', code );
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

						if ( config.show || unintendedError ) {
							console.log( code + '\n\n\n' );
						}

						if ( unintendedError ) throw unintendedError;
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

	describe( 'form', function () {
		var profiles = [
			{ format: 'amd' },
			{ format: 'cjs' },
			{ format: 'es6' },
			{ format: 'iife' },
			{ format: 'umd' }
		];

		sander.readdirSync( FORM ).sort().forEach( function ( dir ) {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, function () {
				var config;

				try {
					config = require( FORM + '/' + dir + '/_config' );
				} catch ( err ) {
					config = { description: dir };
				}

				var bundlePromise = rollup.rollup( FORM + '/' + dir + '/main.js', extend( {}, config.options ) );

				profiles.forEach( function ( profile ) {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, function () {
						return bundlePromise.then( function ( bundle ) {
							var actual = bundle.generate({
								format: profile.format
							}).code.trim();

							try {
								var expected = sander.readFileSync( FORM, dir, '_expected', profile.format + '.js' ).toString().trim();
							} catch ( err ) {
								assert.equal( actual, 'missing file' );
							}

							assert.equal( actual, expected );
						});
					});
				});
			});
		});
	});
});
