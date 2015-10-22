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

function normaliseOutput ( code ) {
	return code.toString().trim().replace( /\r\n/g, '\n' );
}

describe( 'rollup', function () {
	describe( 'sanity checks', function () {
		it( 'exists', function () {
			assert.ok( !!rollup );
		});

		it( 'has a rollup method', function () {
			assert.equal( typeof rollup.rollup, 'function' );
		});

		it( 'fails without options or options.entry', function () {
			assert.throws( function () {
				rollup.rollup();
			}, /must supply options\.entry/ );

			assert.throws( function () {
				rollup.rollup({});
			}, /must supply options\.entry/ );
		});
	});

	describe( 'bundle.write()', function () {
		it( 'fails without options or options.dest', function () {
			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: function () { return 'test'; },
					load: function () {
						return '// empty';
					}
				}]
			}).then( function ( bundle ) {
				assert.throws( function () {
					bundle.write();
				}, /must supply options\.dest/ );

				assert.throws( function () {
					bundle.write({});
				}, /must supply options\.dest/ );
			});
		});

		it( 'expects options.moduleName for IIFE and UMD bundles', function () {
			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: function () { return 'test'; },
					load: function () {
						return 'export var foo = 42;';
					}
				}]
			}).then( function ( bundle ) {
				assert.throws( function () {
					bundle.generate({
						format: 'umd'
					});
				}, /You must supply options\.moduleName for UMD bundles/ );

				assert.throws( function () {
					bundle.generate({
						format: 'iife'
					});
				}, /You must supply options\.moduleName for IIFE bundles/ );
			});
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

							if ( config.generateError ) {
								unintendedError = new Error( 'Expected an error while generating output' );
							}
						} catch ( err ) {
							if ( config.generateError ) {
								config.generateError( err );
							} else {
								unintendedError = err;
							}
						}

						if ( unintendedError ) throw unintendedError;
						if ( config.error || config.generateError ) return;

						var code;

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

						try {
							var fn = new Function( contextKeys, code );
							fn.apply( {}, contextValues );

							if ( config.runtimeError ) {
								unintendedError = new Error( 'Expected an error while executing output' );
							} else {
								if ( config.exports ) config.exports( module.exports );
								if ( config.bundle ) config.bundle( bundle );
							}
						} catch ( err ) {
							if ( config.runtimeError ) {
								config.runtimeError( err );
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

			var config = require( FORM + '/' + dir + '/_config' );

			var options = extend( {}, config.options, {
				entry: FORM + '/' + dir + '/main.js'
			});

			( config.skip ? describe.skip : config.solo ? describe.only : describe)( dir, function () {
				PROFILES.forEach( function ( profile ) {
					it( 'generates ' + profile.format, function () {
						return rollup.rollup( options ).then( function ( bundle ) {
							var options = extend( {}, config.options, {
								dest: FORM + '/' + dir + '/_actual/' + profile.format + '.js',
								format: profile.format
							});

							return bundle.write( options ).then( function () {
								var actualCode = normaliseOutput( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js' ) );
								var expectedCode;
								var actualMap;
								var expectedMap;

								try {
									expectedCode = normaliseOutput( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js' ) );
								} catch ( err ) {
									expectedCode = 'missing file';
								}

								try {
									actualMap = JSON.parse( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js.map' ).toString() );
									actualMap.sourcesContent = actualMap.sourcesContent.map( normaliseOutput );
								} catch ( err ) {}

								try {
									expectedMap = JSON.parse( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js.map' ).toString() );
									expectedMap.sourcesContent = expectedMap.sourcesContent.map( normaliseOutput );
								} catch ( err ) {}

								if ( config.show ) {
									console.log( actualCode + '\n\n\n' );
								}

								assert.equal( actualCode, expectedCode );
								assert.deepEqual( actualMap, expectedMap );
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
				var entry = path.resolve( SOURCEMAPS, dir, 'main.js' );
				var dest = path.resolve( SOURCEMAPS, dir, '_actual/bundle.js' );

				var options = extend( {}, config.options, {
					entry: entry
				});

				PROFILES.forEach( function ( profile ) {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, function () {
						return rollup.rollup( options ).then( function ( bundle ) {
							var options = extend( {}, config.options, {
								format: profile.format,
								sourceMap: true,
								dest: dest
							});

							bundle.write( options );

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
								assert.equal( normaliseOutput( code ), normaliseOutput( expected ) );
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
