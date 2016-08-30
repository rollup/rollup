require( 'source-map-support' ).install();
require( 'console-group' ).install();

const path = require( 'path' );
const sander = require( 'sander' );
const assert = require( 'assert' );
const { exec } = require( 'child_process' );
const buble = require( 'buble' );
const rollup = require( '../dist/rollup' );

const FUNCTION = path.resolve( __dirname, 'function' );
const FORM = path.resolve( __dirname, 'form' );
const SOURCEMAPS = path.resolve( __dirname, 'sourcemaps' );
const CLI = path.resolve( __dirname, 'cli' );

const PROFILES = [
	{ format: 'amd' },
	{ format: 'cjs' },
	{ format: 'es' },
	{ format: 'iife' },
	{ format: 'umd' }
];

function extend ( target ) {
	[].slice.call( arguments, 1 ).forEach( source => {
		source && Object.keys( source ).forEach( key => {
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
		console.error( err.message );
		console.error( err.stack );
		throw new Error( `Failed to load ${path}. An old test perhaps? You should probably delete the directory` );
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

	describe( 'sanity checks', () => {
		it( 'exists', () => {
			assert.ok( !!rollup );
		});

		it( 'has a rollup method', () => {
			assert.equal( typeof rollup.rollup, 'function' );
		});

		it( 'fails without options', () => {
			return rollup.rollup().then( () => {
				throw new Error( 'Missing expected error' );
			}, err => {
				assert.equal( 'You must supply options.entry to rollup', err.message );
			});
		});

		it( 'fails without options.entry', () => {
			return rollup.rollup({}).then( () => {
				throw new Error( 'Missing expected error' );
			}, err => {
				assert.equal( 'You must supply options.entry to rollup', err.message );
			});
		});

		it( 'fails with invalid keys', () => {
			return rollup.rollup({ entry: 'x', plUgins: [] }).then( () => {
				throw new Error( 'Missing expected error' );
			}, err => {
				assert.equal( err.message, 'Unexpected key \'plUgins\' found, expected one of: acorn, banner, cache, context, dest, entry, exports, external, footer, format, globals, indent, intro, moduleId, moduleName, noConflict, onwarn, outro, paths, plugins, preferConst, sourceMap, sourceMapFile, targets, treeshake, useStrict' );
			});
		});
	});

	describe( 'bundle.write()', () => {
		it( 'fails without options or options.dest', () => {
			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: () => { return 'test'; },
					load: () => {
						return '// empty';
					}
				}]
			}).then( bundle => {
				assert.throws( () => {
					bundle.write();
				}, /must supply options\.dest/ );

				assert.throws( () => {
					bundle.write({});
				}, /must supply options\.dest/ );
			});
		});

		it( 'expects options.moduleName for IIFE and UMD bundles', () => {
			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: () => { return 'test'; },
					load: () => {
						return 'export var foo = 42;';
					}
				}]
			}).then( bundle => {
				assert.throws( () => {
					bundle.generate({
						format: 'umd'
					});
				}, /You must supply options\.moduleName for UMD bundles/ );

				assert.throws( () => {
					bundle.generate({
						format: 'iife'
					});
				}, /You must supply options\.moduleName for IIFE bundles/ );
			});
		});

		it( 'warns on es6 format', () => {
			let warned;

			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: () => { return 'test'; },
					load: () => {
						return '// empty';
					}
				}],
				onwarn: msg => {
					if ( /The es6 format is deprecated/.test( msg ) ) warned = true;
				}
			}).then( bundle => {
				bundle.generate({ format: 'es6' });
				assert.ok( warned );
			});
		});
	});

	describe( 'function', () => {
		sander.readdirSync( FUNCTION ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			const config = loadConfig( FUNCTION + '/' + dir + '/_config.js' );
			( config.skip ? it.skip : config.solo ? it.only : it )( dir, () => {
				const warnings = [];
				const captureWarning = msg => warnings.push( msg );

				const options = extend( {
					entry: FUNCTION + '/' + dir + '/main.js',
					onwarn: captureWarning
				}, config.options );

				if ( config.solo ) console.group( dir );

				return rollup.rollup( options )
					.then( bundle => {
						let unintendedError;

						if ( config.error ) {
							throw new Error( 'Expected an error while rolling up' );
						}

						let result;

						// try to generate output
						try {
							result = bundle.generate( extend( {}, config.bundleOptions, {
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

						let code = result.code;

						if ( config.buble ) {
							code = buble.transform( code, {
								transforms: { modules: false }
							}).code;
						}

						if ( config.code ) config.code( code );

						const module = {
							exports: {}
						};

						const context = extend({ require, module, assert, exports: module.exports }, config.context || {} );

						const contextKeys = Object.keys( context );
						const contextValues = contextKeys.map( key => context[ key ] );

						try {
							const fn = new Function( contextKeys, code );
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
					}, err => {
						if ( config.error ) {
							config.error( err );
						} else {
							throw err;
						}
					});
			});
		});
	});

	describe( 'form', () => {
		sander.readdirSync( FORM ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			const config = loadConfig( FORM + '/' + dir + '/_config.js' );

			if ( config.skipIfWindows && process.platform === 'win32' ) return;
			if ( !config.options ) {
				config.options = {};
			}
			if ( !( 'indent' in config.options ) ) {
				config.options.indent = true;
			}

			const options = extend( {}, {
				entry: FORM + '/' + dir + '/main.js',
				onwarn: msg => {
					if ( /No name was provided for/.test( msg ) ) return;
					if ( /as external dependency/.test( msg ) ) return;
					console.error( msg );
				}
			}, config.options );

			( config.skip ? describe.skip : config.solo ? describe.only : describe )( dir, () => {
				const promise = rollup.rollup( options );

				PROFILES.forEach( profile => {
					it( 'generates ' + profile.format, () => {
						return promise.then( bundle => {
							const options = extend( {}, config.options, {
								dest: FORM + '/' + dir + '/_actual/' + profile.format + '.js',
								format: profile.format
							});

							return bundle.write( options ).then( () => {
								const actualCode = normaliseOutput( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js' ) );
								let expectedCode;
								let actualMap;
								let expectedMap;

								try {
									expectedCode = normaliseOutput( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js' ) );
								} catch ( err ) {
									expectedCode = 'missing file';
								}

								try {
									actualMap = JSON.parse( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js.map' ).toString() );
									actualMap.sourcesContent = actualMap.sourcesContent.map( normaliseOutput );
								} catch ( err ) {
									assert.equal( err.code, 'ENOENT' );
								}

								try {
									expectedMap = JSON.parse( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js.map' ).toString() );
									expectedMap.sourcesContent = expectedMap.sourcesContent.map( normaliseOutput );
								} catch ( err ) {
									assert.equal( err.code, 'ENOENT' );
								}

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

	describe( 'sourcemaps', () => {
		sander.readdirSync( SOURCEMAPS ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, () => {
				process.chdir( SOURCEMAPS + '/' + dir );
				const config = loadConfig( SOURCEMAPS + '/' + dir + '/_config.js' );

				const entry = path.resolve( SOURCEMAPS, dir, 'main.js' );
				const dest = path.resolve( SOURCEMAPS, dir, '_actual/bundle' );

				const options = extend( {}, config.options, { entry });

				PROFILES.forEach( profile => {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, () => {
						process.chdir( SOURCEMAPS + '/' + dir );
						return rollup.rollup( options ).then( bundle => {
							const options = extend( {}, {
								format: profile.format,
								sourceMap: true,
								dest: `${dest}.${profile.format}.js`
							}, config.options );

							bundle.write( options );

							if ( config.before ) config.before();
							const result = bundle.generate( options );
							config.test( result.code, result.map );
						});
					});
				});
			});
		});
	});

	describe( 'cli', () => {
		sander.readdirSync( CLI ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, () => {
				const config = loadConfig( CLI + '/' + dir + '/_config.js' );

				( config.skip ? it.skip : config.solo ? it.only : it )( dir, done => {
					process.chdir( config.cwd || path.resolve( CLI, dir ) );

					const command = 'node ' + path.resolve( __dirname, '../bin' ) + path.sep + config.command;

					exec( command, {}, ( err, code, stderr ) => {
						if ( err ) {
							if ( config.error ) {
								config.error( err );
								return done();
							} else {
								throw err;
							}
						}

						if ( stderr ) console.error( stderr );

						let unintendedError;

						if ( config.execute ) {
							try {
								if ( config.buble ) {
									code = buble.transform( code, {
										transforms: { modules: false }
									}).code;
								}

								const fn = new Function( 'require', 'module', 'exports', 'assert', code );
								const module = {
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
								done();
							} catch ( err ) {
								done( err );
							}
						}

						else if ( sander.existsSync( '_expected' ) && sander.statSync( '_expected' ).isDirectory() ) {
							let error = null;
							sander.readdirSync( '_expected' ).forEach( child => {
								const expected = sander.readFileSync( path.join( '_expected', child ) ).toString();
								const actual = sander.readFileSync( path.join( '_actual', child ) ).toString();
								try {
									assert.equal( normaliseOutput( actual ), normaliseOutput( expected ) );
								} catch ( err ) {
									error = err;
								}
							});
							done( error );
						}

						else {
							const expected = sander.readFileSync( '_expected.js' ).toString();
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

	describe( 'incremental', () => {
		function executeBundle ( bundle ) {
			const cjs = bundle.generate({ format: 'cjs' });
			const m = new Function( 'module', 'exports', cjs.code );

			const module = { exports: {} };
			m( module, module.exports );

			return module.exports;
		}

		let resolveIdCalls;
		let transformCalls;
		let modules;

		const plugin = {
			resolveId: id => {
				resolveIdCalls += 1;
				return id;
			},

			load: id => {
				return modules[ id ];
			},

			transform: code => {
				transformCalls += 1;
				return code;
			}
		};

		beforeEach( () => {
			resolveIdCalls = 0;
			transformCalls = 0;

			modules = {
				entry: `import foo from 'foo'; export default foo;`,
				foo: `export default 42`,
				bar: `export default 21`
			};
		});

		it('does not resolves id and transforms in the second time', () => {
			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( resolveIdCalls, 2 );
				assert.equal( transformCalls, 2 );
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache: bundle
				});
			}).then( bundle => {
				assert.equal( resolveIdCalls, 3 ); // +1 for entry point which is resolved every time
				assert.equal( transformCalls, 2 );
				assert.equal( executeBundle( bundle ), 42 );
			});
		});

		it('transforms modified sources', () => {
			let cache;

			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( transformCalls, 2 );
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
				assert.equal( transformCalls, 3 );
				assert.equal( executeBundle( bundle ), 43 );
			});
		});

		it('resolves id of new imports', () => {
			let cache;

			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( resolveIdCalls, 2 );
				assert.equal( executeBundle( bundle ), 42 );

				modules.entry = `import bar from 'bar'; export default bar;`;
				cache = bundle;
			}).then( () => {
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache
				});
			}).then( bundle => {
				assert.equal( resolveIdCalls, 4 );
				assert.equal( executeBundle( bundle ), 21 );
			});
		});
	});

	describe( 'hooks', () => {
		it( 'passes bundle & output object to ongenerate & onwrite hooks', () => {
			const dest = path.join( __dirname, 'tmp/bundle.js' );

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
			const result = [];

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
			const result = [];
			const dest = path.join( __dirname, 'tmp/bundle.js' );

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
