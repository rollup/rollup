require( 'source-map-support' ).install();
require( 'console-group' ).install();

var path = require( 'path' );
var os = require( 'os' );
var sander = require( 'sander' );
var assert = require( 'assert' );
var exec = require( 'child_process' ).exec;
var babel = require( 'babel-core' );
var rollup = require( '../dist/rollup' );

var FUNCTION = path.resolve( __dirname, 'function' );
var FORM = path.resolve( __dirname, 'form' );
var SOURCEMAPS = path.resolve( __dirname, 'sourcemaps' );
var CLI = path.resolve( __dirname, 'cli' );

var PROFILES = [
	{ format: 'amd' },
	{ format: 'cjs' },
	{ format: 'es6' },
	{ format: 'iife' },
	{ format: 'umd' }
];

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
				var options = extend( {}, config.options, {
					entry: FUNCTION + '/' + dir + '/main.js'
				});

				if ( config.solo ) console.group( dir );

				return rollup.rollup( options )
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
								code = babel.transform( result.code, {
									blacklist: [ 'es6.modules' ],
									loose: [ 'es6.classes' ]
								}).code;
							} else {
								code = result.code;
							}

							var module = {
								exports: {}
							};

							var context = extend({
								require: require,
								module: module,
								exports: module.exports,
								assert: assert
							}, config.context || {} );

							var contextKeys = Object.keys( context );
							var contextValues = contextKeys.map( function ( key ) {
								return context[ key ];
							});

							var fn = new Function( contextKeys, code );
							fn.apply( {}, contextValues );

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

						if ( config.solo ) console.groupEnd();

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
		sander.readdirSync( FORM ).sort().forEach( function ( dir ) {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, function () {
				var config = require( FORM + '/' + dir + '/_config' );

				var options = extend( {}, config.options, {
					entry: FORM + '/' + dir + '/main.js'
				});

				PROFILES.forEach( function ( profile ) {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, function () {
						if ( config.solo ) console.group( dir );

						return rollup.rollup( options ).then( function ( bundle ) {
							var options = extend( {}, config.options, {
								dest: FORM + '/' + dir + '/_actual/' + profile.format + '.js',
								format: profile.format
							});

							return bundle.write( options ).then( function () {
								var actualCode = sander.readFileSync( FORM, dir, '_actual', profile.format + '.js' ).toString().trim();
								var expectedCode;
								var actualMap;
								var expectedMap;

								try {
									expectedCode = sander.readFileSync( FORM, dir, '_expected', profile.format + '.js' ).toString().trim();
								} catch ( err ) {
									expectedCode = 'missing file';
								}

								try {
									actualMap = JSON.parse( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js.map' ).toString() );
								} catch ( err ) {}

								try {
									expectedMap = JSON.parse( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js.map' ).toString() );
								} catch ( err ) {}

								assert.equal( actualCode, expectedCode );
								assert.deepEqual( actualMap, expectedMap );

								if ( config.solo ) console.groupEnd();
							});
						});
					});
				});
			});
		});
	});

	describe( 'sourcemaps', function () {
		sander.readdirSync( SOURCEMAPS ).sort().forEach( function ( dir ) {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, function () {
				var config = require( SOURCEMAPS + '/' + dir + '/_config' );

				var options = extend( {}, config.options, {
					entry: SOURCEMAPS + '/' + dir + '/main.js'
				});

				PROFILES.forEach( function ( profile ) {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, function () {
						return rollup.rollup( options ).then( function ( bundle ) {
							var options = extend( {}, config.options, {
								format: profile.format,
								sourceMap: true,
								sourceMapFile: 'bundle.js'
							});

							var result = bundle.generate( options );
							config.test( result.code, result.map );
						});
					});
				});
			});
		});
	});

	describe( 'cli', function () {
		sander.readdirSync( CLI ).sort().forEach( function ( dir ) {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, function () {
				var config = require( CLI + '/' + dir + '/_config' );

				( config.skip ? it.skip : config.solo ? it.only : it )( dir, function ( done ) {
					process.chdir( path.resolve( CLI, dir ) );

					if (os.platform() === 'win32') {
						config.command = "node " + path.resolve( __dirname, '../bin' ) + path.sep + config.command;
					}

					exec( config.command, {
						env: {
							PATH: path.resolve( __dirname, '../bin' ) + path.delimiter + process.env.PATH
						}
					}, function ( err, code, stderr ) {
						if ( err ) return done( err );

						if ( stderr ) console.error( stderr );

						var unintendedError;

						if ( config.execute ) {
							try {
								if ( config.babel ) {
									code = babel.transform( code, {
										blacklist: [ 'es6.modules' ],
										loose: [ 'es6.classes' ]
									}).code;
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

							if ( config.solo ) console.groupEnd();

							unintendedError ? done( unintendedError ) : done();
						}

						else if ( config.result ) {
							try {
								config.result( code );
							} catch ( err ) {
								done( err );
							}
						}

						else {
							var expected = sander.readFileSync( '_expected.js' ).toString();
							try {
								assert.equal( code.trim(), expected.trim() );
								done();
							} catch ( err ) {
								done( err );
							}
						}
					});
				});
			});
		});
	});
});
