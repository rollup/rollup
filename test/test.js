require( 'source-map-support' ).install();
require( 'console-group' ).install();

var path = require( 'path' );
var os = require( 'os' );
var sander = require( 'sander' );
var assert = require( 'assert' );
var exec = require( 'child_process' ).exec;
var buble = require( 'buble' );
var rollup = require( '../dist/rollup' );

var FUNCTION = path.resolve( __dirname, 'function' );
var FORM = path.resolve( __dirname, 'form' );
var SOURCEMAPS = path.resolve( __dirname, 'sourcemaps' );
var CLI = path.resolve( __dirname, 'cli' );

var PROFILES = [
	{ format: 'amd' },
	{ format: 'cjs' },
	{ format: 'es' },
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

function loadConfig ( path ) {
	try {
		return require( path );
	} catch ( err ) {
		throw new Error( 'Failed to load ' + path + '. An old test perhaps? You should probably delete the directory' );
	}
}

function loader ( modules ) {
	return {
		resolveId ( id ) {
			return id;
		},

		load ( id ) {
			return modules[ id ];
		}
	};
}

describe( 'rollup', function () {
	this.timeout( 10000 );

	describe( 'sanity checks', function () {
		it( 'exists', function () {
			assert.ok( !!rollup );
		});

		it( 'has a rollup method', function () {
			assert.equal( typeof rollup.rollup, 'function' );
		});

		it( 'fails without options', function () {
			return rollup.rollup().then( function () {
				throw new Error( 'Missing expected error' );
			}, function (err) {
				assert.equal( 'You must supply options.entry to rollup', err.message );
			});
		});

		it( 'fails without options.entry', function () {
			return rollup.rollup({}).then( function () {
				throw new Error( 'Missing expected error' );
			}, function (err) {
				assert.equal( 'You must supply options.entry to rollup', err.message );
			});
		});

		it( 'fails with invalid keys', function () {
			return rollup.rollup({ entry: 'x', plUgins: [] }).then( function () {
				throw new Error( 'Missing expected error' );
			}, function ( err ) {
				assert.equal( err.message, 'Unexpected key \'plUgins\' found, expected one of: acorn, banner, cache, dest, entry, exports, external, footer, format, globals, indent, intro, moduleId, moduleName, noConflict, onwarn, outro, plugins, preferConst, sourceMap, sourceMapFile, targets, treeshake, useStrict' );
			});
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

		it( 'warns on es6 format', function () {
			var warned;

			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: function () { return 'test'; },
					load: function () {
						return '// empty';
					}
				}],
				onwarn: function ( msg ) {
					if ( /The es6 format is deprecated/.test( msg ) ) warned = true;
				}
			}).then( function ( bundle ) {
				bundle.generate({ format: 'es6' });
				assert.ok( warned );
			});
		});
	});

	describe( 'function', function () {
		sander.readdirSync( FUNCTION ).sort().forEach( function ( dir ) {
			if ( dir[0] === '.' ) return; // .DS_Store...

			var config = loadConfig( FUNCTION + '/' + dir + '/_config.js' );
			( config.skip ? it.skip : config.solo ? it.only : it )( dir, function () {
				var warnings = [];
				var captureWarning = msg => warnings.push( msg );

				var options = extend( {
					entry: FUNCTION + '/' + dir + '/main.js',
					onwarn: captureWarning
				}, config.options );

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

						var code = result.code;

						if ( config.buble ) {
							code = buble.transform( code, {
								transforms: { modules: false }
							}).code;
						}

						if ( config.code ) config.code( code );

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

						if ( config.warnings ) {
							config.warnings( warnings );
						} else if ( warnings.length ) {
							throw new Error( `Got unexpected warnings:\n${warnings.join('\n')}` );
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

			var config = loadConfig( FORM + '/' + dir + '/_config.js' );

			if ( config.skipIfWindows && process.platform === 'win32' ) return;

			var options = extend( {}, config.options, {
				entry: FORM + '/' + dir + '/main.js',
				onwarn: msg => {
					if ( /No name was provided for/.test( msg ) ) return;
					if ( /as external dependency/.test( msg ) ) return;
					console.error( msg );
				}
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
				process.chdir( SOURCEMAPS + '/' + dir );
				var config = loadConfig( SOURCEMAPS + '/' + dir + '/_config.js' );

				var entry = path.resolve( SOURCEMAPS, dir, 'main.js' );
				var dest = path.resolve( SOURCEMAPS, dir, '_actual/bundle' );

				var options = extend( {}, config.options, {
					entry: entry
				});

				PROFILES.forEach( function ( profile ) {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, function () {
						process.chdir( SOURCEMAPS + '/' + dir );
						return rollup.rollup( options ).then( function ( bundle ) {
							var options = extend( {}, {
								format: profile.format,
								sourceMap: true,
								dest: `${dest}.${profile.format}.js`
							}, config.options );

							bundle.write( options );

							if ( config.before ) config.before();
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
				var config = loadConfig( CLI + '/' + dir + '/_config.js' );

				( config.skip ? it.skip : config.solo ? it.only : it )( dir, function ( done ) {
					process.chdir( config.cwd || path.resolve( CLI, dir ) );

					const command = 'node ' + path.resolve( __dirname, '../bin' ) + path.sep + config.command;

					exec( command, {}, function ( err, code, stderr ) {
						if ( err ) {
							if ( config.error ) {
								config.error( err );
								return done();
							} else {
								throw err;
							}
						}

						if ( stderr ) console.error( stderr );

						var unintendedError;

						if ( config.execute ) {
							try {
								if ( config.buble ) {
									code = buble.transform( code, {
										transforms: { modules: false }
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

						else if ( sander.existsSync( '_expected' ) && sander.statSync( '_expected' ).isDirectory() ) {
							var error = null;
							sander.readdirSync( '_expected' ).forEach( child => {
								var expected = sander.readFileSync( path.join( '_expected', child ) ).toString();
								var actual = sander.readFileSync( path.join( '_actual', child ) ).toString();
								try {
									assert.equal( normaliseOutput( actual ), normaliseOutput( expected ) );
								} catch ( err ) {
									error = err;
								}
							});
							done( error );
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

	describe('incremental', function () {
		function executeBundle ( bundle ) {
			const cjs = bundle.generate({ format: 'cjs' });
			const m = new Function( 'module', 'exports', cjs.code );

			let module = { exports: {} };
			m( module, module.exports );

			return module.exports;
		}

		var calls;
		var modules;

		var plugin = {
			resolveId: id => id,

			load: id => {
				return modules[ id ];
			},

			transform: function ( code ) {
				calls += 1;
				return code;
			}
		};

		beforeEach( () => {
			calls = 0;

			modules = {
				entry: `import foo from 'foo'; export default foo;`,
				foo: `export default 42`
			};
		});

		it('does not transforms in the second time', function () {
			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( calls, 2 );
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache: bundle
				});
			}).then( bundle => {
				assert.equal( calls, 2 );
				assert.equal( executeBundle( bundle ), 42 );
			});
		});

		it('transforms modified sources', function () {
			let cache;

			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( calls, 2 );
				assert.equal( executeBundle( bundle ), 42 );

				modules.foo = `export default 43`;
				cache = bundle;
			}).then( () => {
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache
				});
			}).then( bundle => {
				assert.equal( calls, 3 );
				assert.equal( executeBundle( bundle ), 43 );
			});
		});
	});

	describe( 'hooks', () => {
		it( 'passes bundle & output object to ongenerate & onwrite hooks', () => {
			var dest = path.join( __dirname, 'tmp/bundle.js' );
			
			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						ongenerate ( bundle, out ) {
							out.ongenerate = true;
						},

						onwrite (bundle, out ) {
							assert.equal(out.ongenerate, true);
						}
					}
				]
			}).then( bundle => {
				return bundle.write({
					dest
				});
			}).then( () => {
				return sander.unlink( dest );
			});
		});

		it( 'calls ongenerate hooks in sequence', () => {
			var result = [];

			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						ongenerate ( info ) {
							result.push({ a: info.format });
						}
					},
					{
						ongenerate ( info ) {
							result.push({ b: info.format });
						}
					}
				]
			}).then( bundle => {
				bundle.generate({ format: 'cjs' });

				assert.deepEqual( result, [
					{ a: 'cjs' },
					{ b: 'cjs' }
				]);
			});
		});

		it( 'calls onwrite hooks in sequence', () => {
			var result = [];
			var dest = path.join( __dirname, 'tmp/bundle.js' );

			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						onwrite ( info ) {
							return new Promise( ( fulfil ) => {
								result.push({ a: info.dest, format: info.format });
								fulfil();
							});
						}
					},
					{
						onwrite ( info ) {
							result.push({ b: info.dest, format: info.format });
						}
					}
				]
			}).then( bundle => {
				return bundle.write({
					dest,
					format: 'cjs'
				});


			}).then( () => {
				assert.deepEqual( result, [
					{ a: dest, format: 'cjs' },
					{ b: dest, format: 'cjs' }
				]);

				return sander.unlink( dest );
			});
		});
	});
});
